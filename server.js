import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { ObjectId } from "mongodb";

// Inicializando o express antes de usar qualquer middleware
const app = express();
const prisma = new PrismaClient();

// Usando o middleware cors após a inicialização do app
app.use(cors());
app.use(express.json()); // Para poder lidar com JSON no corpo da requisição

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao MongoDB");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
}

main();

const PORT = 3000;

// Rota raiz
app.get("/", (req, res) => {
  res.send("Rota raiz");
});

// Lista todos os produtos
// Lista todos os produtos do banco
app.get("/produtos", async (req, res) => {
  let produtos = [];
  if (req.query) {
    produtos = await prisma.product.findMany({
      where: {
        name: req.query.name,
        price: req.query.price,
        status: req.query.status,
      },
    });
  } else {
    produtos = await prisma.product.findMany(); // Busca no banco
  }

  res.status(200).json(produtos);
});

// Adiciona um novo produto
app.post("/produtos", async (req, res) => {
  await prisma.product.create({
    data: {
      name: req.body.name,
      price: req.body.price,
      status: req.body.status,
    },
  });
  res.status(201).json(req.body);
});

// Atualiza um produto
// Atualiza um produto
app.put("/produtos/:id", async (req, res) => {
  const { id } = req.params;

  // Verificar se o ID é válido
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await prisma.product.update({
      where: {
        id: id, // Prisma espera um ObjectId válido
      },
      data: {
        name: req.body.name,
        price: req.body.price,
        status: req.body.status,
      },
    });

    res.status(201).json(req.body);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});


// Deleta um produto
app.delete("/produtos/:id", async (req, res) => {
  const { id } = req.params;

  // Verificar se o ID é válido
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await prisma.product.delete({
      where: {
        id: id, // Prisma espera um ObjectId válido
      },
    });

    res.status(200).json({ message: "Produto deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar o produto" });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
