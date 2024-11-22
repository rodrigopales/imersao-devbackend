import {getTodosPosts, criarPost, atualizarPost} from "../models/postsModel.js";
import fs from "fs";
import gerarDescricaoComGemini from "../services/geminiService.js"
import multer from "multer";

// Função para listar todos os posts
export async function listarPosts(req, res) {
  // Busca todos os posts do banco de dados
  const posts = await getTodosPosts();
  // Envia uma resposta HTTP com status 200 (OK) e os posts em formato JSON
  res.status(200).json(posts);
}

// Função para criar um novo post
export async function postarNovoPost(req, res) {
  const novoPost = req.body;
  try {
    // Cria um novo post no banco de dados
    const postCriado = await criarPost(novoPost);
    res.status(200).json(postCriado);
  } catch(erro) {
    console.error(erro.message);
    res.status(500).json({"Erro":"Falha na requisição"})
  }
}

// Função para fazer upload de uma imagem e criar um novo post
export async function uploadImagem(req, res) {
  // Cria um novo objeto de post com a imagem
  const novoPost = {
    descricao: "",
    imgUrl: req.file.originalname, // Problema: usa o nome original, pode haver colisões
    alt: ""
  };

  try {
    // Cria um novo post no banco de dados
    const postCriado = await criarPost(novoPost);
    // Renomeia o arquivo da imagem com o ID do post (problema de concorrência)
    const imagemAtualizada = `uploads/${postCriado.insertedId}.png`
    fs.renameSync(req.file.path, imagemAtualizada)
    res.status(200).json(postCriado);
  } catch(erro) {
    console.error(erro.message);
    res.status(500).json({"Erro":"Falha na requisição"})
  }
}

// Função para atualizar um post existente
export async function atualizarNovoPost(req, res) {
  const id = req.params.id;
  const urlImagem = `http://localhost:3000/${id}.png`
  try {
    // Lê a imagem do sistema de arquivos
    const imgBuffer = fs.readFileSync(`uploads/${id}.png`)
    // Gera uma descrição para a imagem usando o serviço Gemini
    const descricao = await gerarDescricaoComGemini(imgBuffer)

    // Cria um novo objeto de post com a imagem e descrição
    const post = {
      imgUrl: urlImagem,
      descricao: descricao,
      alt: req.body.alt
    }

    // Atualiza o post no banco de dados
    const postCriado = await atualizarPost(id, post);
    res.status(200).json(postCriado);
  } catch(erro) {
    console.error(erro.message);
    res.status(500).json({"Erro":"Falha na requisição"});
  }
}