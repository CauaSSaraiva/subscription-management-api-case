import { Role } from "../generated/prisma/enums";
import { prisma } from "../prisma";
import { hash } from "bcrypt";

async function main() {
  console.log("Seeding ... ...");

  // Criar os usuários necessários

  const adminPassword = await hash("admin123", 6); // Em produção, usar env, obviamente. 
  const systemId = process.env.SYSTEM_USER_ID;

  if (!systemId) {
    throw new Error(
      "ERRO: A variável SYSTEM_USER_ID não está definida em variável de ambiente. O Seed não pode continuar.",
    );
  }
  
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@empresa.com" },
    update: {}, // Se já existe, não faz nada
    create: {
      nome: "Super Admin",
      email: "admin@empresa.com",
      senha: adminPassword,
      role: Role.ADMIN,
      precisaTrocarSenha: false
    },
  });

  // usuário para logs de/e ações do sistema (como cron)
  const systemUser = await prisma.usuario.upsert({
    where: { email: "sistema@sistema.com" },
    update: {}, // Se já existe, não faz nada
    create: {
      id: systemId,
      nome: "System User",
      email: "sistema@sistema.com",
      senha: adminPassword,
      role: Role.ADMIN,
      precisaTrocarSenha: false,
    },
  });

  console.log(`\nUsuário Admin criado: ${admin.email}`);


// (OPCIONAL) - implementar?
//   if (process.env.NODE_ENV !== 'production') {
//     await seedDemoData();
//   }
}


// async function seedDemoData() {
//   // departamentos e assinaturas fakes futuramente
//   // para testar sem ter que cadastrar na mão.
// }


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
