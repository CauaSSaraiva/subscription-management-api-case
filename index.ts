import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { usuarioRoutes } from "./routes/usuario.routes";
import { authRoutes } from "./routes/auth.routes";
import { servicoRoutes } from "./routes/servico.routes";
import { departamentoRoutes } from "./routes/departamento.routes";
import { assinaturaRoutes } from "./routes/assinatura.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }),
);

app.use("/usuarios", usuarioRoutes)
app.use("/auth", authRoutes)
app.use("/servicos", servicoRoutes)
app.use("/departamentos", departamentoRoutes)
app.use("/assinaturas", assinaturaRoutes)
app.use("/dashboard", dashboardRoutes)


app.get("/", (req, res) => {
  res.send("API: Sistema Rodando");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
