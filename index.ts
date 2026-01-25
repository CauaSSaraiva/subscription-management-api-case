import express from "express";
import cors from "cors";

import { usuarioRoutes } from "./routes/usuario.routes";
import { authRoutes } from "./routes/auth.routes";
import { servicoRoutes } from "./routes/servico.routes";
import { departamentoRoutes } from "./routes/departamento.routes";

const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());

app.use("/usuarios", usuarioRoutes)
app.use("/login", authRoutes)
app.use("/servicos", servicoRoutes)
app.use("/departamentos", departamentoRoutes)


app.get("/", (req, res) => {
  res.send("API: Sistema Rodando");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
