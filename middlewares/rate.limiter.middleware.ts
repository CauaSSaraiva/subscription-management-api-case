import rateLimit from "express-rate-limit";

const ENV_SECRET = process.env.INTERNAL_API_SECRET;

// lidar com caso específico de proxy reverso usado no front
// por conta dos deploy em domínios diferentes e free-tier
// e evitando spoofing
const pegarIpSafe = (req: any): string => {
  const secretHeader = req.headers["x-internal-secret"];

  // Chamada autenticada (vem do front/proxy)
  if (ENV_SECRET && secretHeader === ENV_SECRET) {
    const forwarded = req.headers["x-forwarded-for"];

    // se tem IP repassado (é o proxy do client-side), usa esse IP.
    if (forwarded) {
      return (typeof forwarded === "string" ? forwarded : forwarded[0])
        .split(",")[0]
        .trim();
    }

    // fail-safe caso a função de skip falhar (skip roda primeiro, em teoria nunca cairá aqui e nem deve)
    return "TRUSTED_SSR_SERVER";
  }

  // Chamada Direta sem secret (ataque ou acesso indevido)
  return req.ip || "127.0.0.1";
};

// skipar chamadas server-side confiáveis do next.js
const devePular = (req: any): boolean => {
  const secretHeader = req.headers["x-internal-secret"];
  const forwarded = req.headers["x-forwarded-for"];

  // evitar bloquear o próprio servidor do front de renderizar páginas.
  if (ENV_SECRET && secretHeader === ENV_SECRET && !forwarded) {
    console.log("[RateLimit] Pular verificação: SSR Confiável detectado.");
    return true;
  }
  return false;
};

// limiter global (todas rotas)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // limite de req. da janela
  standardHeaders: true, // retorna info nos headers `RateLimit-*`
  legacyHeaders: false, // desabilita os headers `X-RateLimit-*` (antigos)

  //identificando o usuario / de onde vem
  keyGenerator: pegarIpSafe,
  skip: devePular, // ssr

  message: {
    status: 429,
    message:
      "Muitas requisições criadas a partir deste IP, tente novamente após 15 minutos.",
  },
});

// limiter estrito ( login / brute-force)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 req.
  //identificando o usuario / de onde vem
  keyGenerator: pegarIpSafe,
  skip: devePular,

  message: {
    status: 429,
    message:
      "Muitas tentativas de login. Sua conta foi temporariamente bloqueada por segurança. Tente novamente em 1 hora.",
  },
});
