import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi.registry";

export function generateOpenAPI() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Subscription Manager API",
      description: "API Documentada",
    },
    servers: [
      { url: "https://subscription-management-api-case.onrender.com" },
      { url: "http://localhost:3004" },
    ],
  });
}
