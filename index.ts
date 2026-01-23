import express from "express";
import cors from "cors";

const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
  res.send("API: Sistema Rodando");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
