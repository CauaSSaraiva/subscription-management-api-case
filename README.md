# Case de Estudo Técnico - Subscription Manager (Gerenciamento de Assinaturas)
![Badge Status](https://img.shields.io/badge/STATUS-V1_COMPLETED-brightgreen) ![Badge Tech](https://img.shields.io/badge/FOCUS-Backend_Architecture-blue) ![Badge TS](https://img.shields.io/badge/LANG-TypeScript_Strict-blue)

> **Este repositório é um laboratório de Engenharia de Software.**
>
> Não se trata de um produto comercial, mas sim de um **Case Técnico** desenvolvido para aplicar padrões de arquitetura robustos, segurança e rastreabilidade de dados.
---
*(OBS: Deploy Front/API com Cold-Start, 10-50s)*

🔗 **Deploy (Frontend):** [[Link da Vercel Aqui](https://subscription-management-front-case.vercel.app/)]

🔗 **API Base URL/Deploy:** [[Link do Render Aqui](https://subscription-management-api-case.onrender.com/)]

📂 **Repositório Frontend:** [[Link do GitHub do Front](https://github.com/CauaSSaraiva/subscription-management-front-case)]

> [!IMPORTANT]
> **Credenciais de Acesso (Demo / Seed)**
>
> Para testar as funcionalidades de Admin (Gestão de Usuários, Auditoria), utilize:
> * **E-mail:** `admin@empresa.com`
> * **Senha:** `admin123`


## Preview

### Dashboard de Gestão
**Interface consumindo a API para cálculo de KPIs. O gráfico de barras usa a estratégia de "Application-Side Join" (citada abaixo) para renderizar gastos por departamento sem N+1 queries.*

![Dashboard Preview](https://i.imgur.com/Phvz49y.png)

## Arquitetura e Decisões Técnicas

O backend foi construído seguindo **Layered Architecture** (Camadas). A comunicação entre camadas é protegida por contratos de tipagem forte (TypeScript) e validação de schema (Zod).


### Estrutura de Camadas

* **Routes:** Definição dos endpoints e aplicação de middlewares de rotas (Authentication/RBAC).

* **Controllers (Adaptadores):** Porteiros da aplicação.
  * **Validação de Entrada:** Utilizam **Zod** (`.safeParse`) para garantir a integridade dos dados (`body`, `query`, `params`) antes de chamar o Service.

  * **Orquestração:** Mapeiam o resultado do Service (`ServiceResult`) para o status HTTP correto (200, 201, 400, 404), sem vazar lógica de negócio.

* **Services (Core Domain):** Regras de negócio puras.
  * **Isolamento:** Não possuem dependência do framework HTTP (Express). Não recebem `req` nem `res`.

  * **Retorno Padronizado:** Implementam o **Result Pattern** para evitar *exceptions* descontroladas.

* **Prisma (DB/ORM):** Abstração do acesso a dados com Type-Safety garantido.


### Stack Tecnológico

* **Runtime:** Node.js
* **Linguagem:** TypeScript (Strict Mode)
* **ORM:** Prisma
* **Database:** PostgreSQL (Neon.tech)
* **Validação:** Zod
* **Framework:** Express
* **Segurança/Auth:** JWT (JSON Web Tokens) e Bcrypt

---

### 💫 Destaques da Implementação (V1)

#### 1. Padrões de Código e Performance

* **"Result Pattern"**: Para evitar o anti-padrão de lançar erros genéricos ou passar o objeto `res` para o Service, adotei um padrão de retorno tipado. O Service devolve um objeto de sucesso ou erro controlado, e o Controller decide como apresentar isso.
    ```typescript
    // Exemplo real do projeto (ServiceResult)
    export type ServiceResult<T> =
      | { ok: true; data: T; meta?: PaginationMeta } // Sucesso explícito
      | { ok: false; error: ServiceError; statusCode: number }; // Erro de negócio tratado

    ```
* **Anti-N+1 Queries (Application-Side Join):** Evitei o problema clássico de iterar sobre uma lista fazendo queries adicionais pra cada item da lista. Utilizo agrupamento (`groupBy`), extraio os IDs e faço apenas **uma** consulta adicional (`WHERE IN`), cruzando os dados em memória via Hash Map (O(1)).

#### 2. Controle de Tráfego (Rate Limiting)
Implementei Rate Limiting contra Brute-Force e DDoS  resolvendo desafios de infraestrutura (Render/Vercel).
* **Arquitetura Base:** Estratégia de *Fixed Window* (100 req/10min para rotas comuns, 5 req/1h para Auth).

* **Desafio:** Em nuvem, o IP de conexão (`req.ip`) geralmente é do Load Balancer. Confiar cegamente no `x-forwarded-for` permite spoofing. Além disso, o Server-Side Rendering (SSR) do Next.js poderia ser bloqueado ao fazer requisições do servidor.
* **Solução "Conditional Trust":** 
um **Key Generator Customizado** com um "Handshake Secreto":
    * **Tráfego Cliente (Proxy):** Se possui o Segredo + `x-forwarded-for`, o sistema confia no header e extrai o IP real do cliente.
    * **Tráfego SSR (Servidor):** Se possui Segredo mas sem IP repassado, é identificado como "TRUSTED_SSR_SERVER" (bypass).
    * **Tráfego Não Confiável:** Sem segredo, ignora headers injetados e bloqueia o IP de conexão real.


#### 3. Auditoria e Integridade de dados

* **Audit Logs com State Diffing:** O sistema registra não apenas "quem fez", mas "o que mudou". Operações de `UPDATE` salvam um snapshot JSON comparando `oldValues` vs `newValues`.

  Exemplo visual pelo front:
  ![LogsDiffVisual](https://i.imgur.com/dB3Eh4L.png)

* **Soft Delete:** Nenhuma assinatura é removida 'fisicamente', mantendo dados no banco.
* **Transações Atômicas:** Uso de `prisma.$transaction` em operações de leitura complexas (ex: paginação que exige `count` + `findMany` simultâneos) para garantir consistência de leitura.
* **Sanitização de Datas:** Tratamento centralizado (`DateUtils`) para garantir consistência de UTC no início/fim de vigência das assinaturas.


#### 4. Segurança

* **Mitigação de Timing Attacks:** No fluxo de login, o sistema executa uma comparação de hash simulada (`FAKE_HASH`) mesmo quando o e-mail não é encontrado. Isso padroniza o tempo de resposta da API, impedindo que atacantes descubram quais e-mails estão cadastrados baseados na latência da resposta (User Enumeration).

* **Autenticação JWT em HttpOnly Cookies:** Autenticação via cookie seguro para mitigar riscos de XSS, com API Proxy no Frontend para resolver CORS entre domínios (Vercel/Render), garantindo a entrega dos cookies de autenticação mesmo em navegadores com políticas estritas de privacidade.

#### 5. Concorrência e Automação
* **Optimistic Locking:** Implementado via versionamento (`@version`) na entidade **Assinatura**. Como é a tabela transacional central, isso previne *Race Conditions* onde dois admin/manager tentam editar o mesmo contrato simultaneamente.

  ![ExemploVisualConcorrencia](https://i.imgur.com/0bLubDh.png)

* **Cron Jobs (GitHub Actions):** Automação para verificar vencimentos diariamente (Schedule Task). O script possui lógica de "Wake Up" para lidar com o *Cold Start* da Render, garantindo que a API esteja online antes de processar a fila.

  ![ExemploVisualCron](https://i.imgur.com/9i4kGft.png)

##  Funcionalidades (Roadmap)

O desenvolvimento foi planejado em fases para simular necessidade de entrega, priorizando a base na V1.

### ✅ V1 - MVP (Base)
Foco na "base" com Segurança inicial, Auditoria e Fluxos de Governança.

* [x] **Gestão de Assinaturas (Core):** Ciclo de vida completo (CRUD) com **Paginação** (Server-Side), Filtros dinâmicos e *Soft Delete*.
* [x] **Identity & Access Management (IAM):**
    * **Seed:** Geração automática de *Super Admin* para setup inicial.
    * **Gestão de Equipe:** Controle admin sobre o provisionamento/manutenção de contas, com atribuição estrita de cargos (RBAC).
    * **Onboarding Seguro:** Geração de senha provisória (criptografada no banco) padronizada (ex: `Mudar.Nome123`) ou personalizada.
    * **Force Change Password:** Fluxo obrigatório de troca de senha no primeiro login.
* [x] **Auditoria Avançada:** Registro de logs para auditoria de acesso e também logs com *State Diffing* (comparação JSON de `oldValues` vs `newValues`) para rastreabilidade total de alterações críticas.
* [x] **Departamentos & Serviços:** Gestão completa (CRUD), Soft Delete e organização estrutural por centros de custo.
* [x] **"Infraestrutura":** Deploy da API no Render e Frontend na Vercel. Utilização Proxy no Front para contornar o bloqueio de Third-Party Cookies dos navegadores modernos e permitindo o uso seguro de cookies HttpOnly com SameSite=Lax.

### 🟡 V2 - Evoluções (Atual)
Foco em melhorias da 'base' e robustez.
* [x] **Documentação:** Migração da coleção do Insomnia para **Swagger/OpenAPI**.
* [x] **Concorrência:** Implementação de *Optimistic Locking* (versionamento de linha) para evitar conflitos de edição simultânea.
* [x] **Automação:** *Background Jobs* (Cron) para verificação diária de vencimentos e alteração automática de status.
* [x] **Rate Limit**: Controle/Proteção do Fluxo de Requisições e evitar Brute-Force
* [x] **Auditoria Visual:** Interface gráfica para visualização dos logs no Dashboard.
* [ ] **Testes:** Cobertura de testes.
* [ ] **Notificações:** Alertas por e-mail para assinaturas prestes a expirar.

### Documentação da API


A documentação interativa da API está disponível via **Swagger UI**. É a forma mais rápida de testar os endpoints e visualizar os schemas de dados diretamente pelo navegador.

**Acessar Swagger UI:** https://subscription-management-api-case.onrender.com/api-docs/

![Exemplo Visual Swagger](https://i.imgur.com/edfMihU.png)

**Alternativa (Insomnia):**
Caso prefira testar localmente, a coleção de requisições está disponível em 📂 `docs/Insomnia_v1_collection.yaml`.
1. Importe o arquivo no **Insomnia**.
2. Selecione o ambiente no menu superior esquerdo (**Dev** para `localhost:3004` ou **Prod** para a API no Render).
> [!WARNING]
> 1. **Selecione o Ambiente:** No Insomnia O "Base Environment" vem vazio. Escolha **Dev (Local)** ou **Prod (Render)** no menu superior esquerdo.
> Já no Swagger, é exibido para ser selecionado no topo em 'Servers'.
> 2. **Autenticação Obrigatória:** O sistema utiliza **HttpOnly Cookies**. Antes de testar rotas protegidas (ex: criar assinaturas), execute a requisição de `Login`. O Insomnia/Navegador(Swagger) gerenciará o cookie automaticamente para as próximas chamadas.

---

## Como rodar localmente

### Pré-requisitos

* Node.js 18+
* PostgreSQL (ou Docker, Hospedado, etc.)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/CauaSSaraiva/subscription-management-api-case.git

# Instale as dependências
npm install

# Configure as variáveis (Crie o arquivo .env baseado no .env.example)
cp .env.example .env

# Execute as migrações e o Seed
npx prisma migrate dev
npx prisma db seed

# Inicie o servidor
npm run dev

```

---

### 👤 Autor

Desenvolvido por **Cauã Stocker Saraiva**.
Projeto criado para demonstrar competências em Arquitetura de Software, Desenvolvimento Backend e Fullstack, e ao mesmo tempo servir de case de estudo e aprimoramento.

[Link pro LinkedIn](https://www.linkedin.com/in/cau%C3%A3-stocker-saraiva-4350072b9/)

---