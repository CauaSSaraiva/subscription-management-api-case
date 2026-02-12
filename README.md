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

---

### 💫 Destaques da Implementação (V1)

#### 1. The "Result Pattern" (Service-Controller Communication)

Para evitar o anti-padrão de lançar erros genéricos ou passar o objeto `res` para o Service, adotei um padrão de retorno tipado. O Service devolve um objeto de sucesso ou erro controlado, e o Controller decide como apresentar isso.

```typescript
// Exemplo real do projeto (ServiceResult)
export type ServiceResult<T> =
  | { ok: true; data: T; meta?: PaginationMeta } // Sucesso explícito
  | { ok: false; error: ServiceError; statusCode: number }; // Erro de negócio tratado

```

#### 2. Performance e Otimização de Queries (Anti-N+1)
No carregamento de gráficos do Dashboard, utilizei a estratégia de **Application-Side Join** para evitar o problema de N+1 Queries.
* **O Problema:** Iterar sobre um agrupamento e buscar o nome do departamento um a um.
* **A Solução:** Realizo o agrupamento (`groupBy`), extraio os IDs e faço apenas **uma** consulta adicional (`WHERE IN`), cruzando os dados em memória usando um `Map` (Hash Table) para acesso O(1).

#### 3. Auditoria e Rastreabilidade (Audit Logs)

Além de auditoria "básica" sobre Acesso/Login e relacionados contendo ip/user-agent, há também Logs de auditoria em que o sistema **não apenas registra "quem fez", mas "o que mudou".**

* **State Diffing:** Operações de atualização (`UPDATE`) salvam um snapshot JSON comparando `oldValues` vs `newValues`.
* **Contexto:** Logs capturam ID do usuário, Entidade afetada e Ação realizada.

Exemplo da estrutura salva no banco (resumido para evitar poluição do README):
```JSON
[
  {
    "id": "0f1e7796-e33a-41a7-90a1-7618a63b7f5b",
    "acao": "UPDATE",
    "entidade": "Assinatura",
    "entidadeId": "c34e0460-8161-4dac-824b-fbebeb8f9b39",
    "usuarioId": "8ef6129f-12f3-49ac-86a2-1a76b173ff99",
    "createdAt": "2026-02-02 21:32:35.955",
    "oldValues": {
      "status": "RENOVACAO_PENDENTE",
      "endDate": null,
      "version": 1,
      "updatedAt": "2026-02-02T21:32:04.412Z"
    },
    "newValues": {
      "status": "RENOVACAO_PENDENTE",
      "endDate": "2027-03-10T23:59:59.999Z",
      "service": { "nome": "teste" },
      "responsavel": { "email": "teste@gmail.com" },
      "departamento": { "descricao": "departamento2" }
    }
  }
]
```
#### 4. Integridade e Segurança de Dados

* **Mitigação de Timing Attacks:** No fluxo de login, o sistema executa uma comparação de hash simulada (`FAKE_HASH`) mesmo quando o e-mail não é encontrado. Isso padroniza o tempo de resposta da API, impedindo que atacantes descubram quais e-mails estão cadastrados baseados na latência da resposta (User Enumeration).

* **Soft Delete:** Nenhuma assinatura é removida fisicamente do banco. O método `deletar` apenas preenche o campo `deletedAt`, mantendo histórico fiscal/legal.

* **Transações Atômicas:** Uso de `prisma.$transaction` em operações de leitura complexas (ex: paginação que exige `count` + `findMany` simultâneos) para garantir consistência de leitura.

* **Sanitização de Datas:** Tratamento centralizado (`DateUtils`) para garantir consistência de UTC no início/fim de vigência das assinaturas.

* **HttpOnly Cookies:** Autenticação via cookie seguro para mitigar riscos de XSS, com API Proxy no Frontend para resolver CORS entre domínios (Vercel/Render).




##  Funcionalidades (Roadmap)

O desenvolvimento foi planejado em fases para simular necessidade de entrega, priorizando a base na V1.

### ✅ V1 - MVP (Entregue)
Foco na "base" com Segurança inicial, Auditoria e Fluxos de Governança.

* [x] **Gestão de Assinaturas (Core):** Ciclo de vida completo (CRUD) com **Paginação** (Server-Side), Filtros dinâmicos e *Soft Delete*.
* [x] **Identity & Access Management (IAM):**
    * **Seed:** Geração automática de *Super Admin* para setup inicial.
    * **Gestão de Equipe:** Controle admin sobre o provisionamento/manutenção de contas, com atribuição estrita de cargos (RBAC).
    * **Onboarding Seguro:** Geração de senha provisória padronizada (ex: `Mudar.Nome123`) ou personalizada.
    * **Force Change Password:** Fluxo obrigatório de troca de senha no primeiro login.
* [x] **Auditoria Avançada:** Registro de logs para auditoria de acesso e também logs com *State Diffing* (comparação JSON de `oldValues` vs `newValues`) para rastreabilidade total de alterações críticas.
* [x] **Departamentos & Serviços:** Gestão completa (CRUD), Soft Delete e organização estrutural por centros de custo.
* [x] **"Infraestrutura":** Deploy integrado (API no Render + Front na Vercel) com Proxy para resolução de CORS.

### 🟡 V2 - Evoluções Planejadas (Backlog)
Funcionalidades mapeadas para a próxima evolução de engenharia.

* [ ] **Documentação:** Migração da coleção do Insomnia para **Swagger/OpenAPI**.
* [ ] **Concorrência:** Implementação de *Optimistic Locking* (versionamento de linha) para evitar conflitos de edição simultânea.
* [ ] **Automação:** *Background Jobs* (Cron) para verificação diária de vencimentos e alteração automática de status.
* [ ] **Rating Limit**: Controle/Proteção do Fluxo de Requisições e evitar Brute-Force
* [ ] **Testes:** Cobertura de testes de integração (E2E).
* [ ] **Auditoria Visual:** Interface gráfica para visualização dos logs no Dashboard.
* [ ] **Notificações:** Alertas por e-mail para assinaturas prestes a expirar.


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

### Documentação da API

Atualmente, a coleção das requisições pode ser importada no **Insomnia** através do arquivo localizado em 📂 `docs/Insomnia_v1_collection.yaml`.

**Como utilizar:**
1. Importe o arquivo no **Insomnia**.
2. No canto superior esquerdo, clique no menu de ambientes (inicialmente estará como *"Base Environment"*).
3. Selecione o ambiente desejado para preencher a `base_url`:
   -  **Dev (Local):** Conecta em `http://localhost:3004`
   -  **Prod/Deploy (Render):** Conecta na API online

> [!WARNING]
> 1. **Selecione o Ambiente:** O "Base Environment" vem vazio. Escolha **Dev (Local)** ou **Prod (Render)** no menu superior esquerdo.
> 2. **Autenticação Obrigatória:** O sistema utiliza **HttpOnly Cookies**. Antes de testar rotas protegidas (ex: criar assinaturas), execute a requisição de `Login`. O Insomnia gerenciará o cookie automaticamente para as próximas chamadas.

---

### 👤 Autor

Desenvolvido por **Cauã Stocker Saraiva**.
Projeto criado para demonstrar competências em Arquitetura de Software, Desenvolvimento Backend e Fullstack, e ao mesmo tempo servir de case de estudo e aprimoramento.

[Link pro LinkedIn](https://www.linkedin.com/in/cau%C3%A3-stocker-saraiva-4350072b9/)

---