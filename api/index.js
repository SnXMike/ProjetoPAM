const express = require('express');
const mysql = require('mysql2/promise');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
 
const app = express();
app.disable("x-powered-by");
 
app.use(express.json());
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cadastros',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
 
// Configuração do Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de prova PAM',
      version: '1.0.0',
      description: 'Prova tendo que conter os itens: CPF, nome, idade, cep e endereço'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ]
  },
  apis: ['index.js']
};
 
const swaggerSpec = swaggerJSDoc(options);
 
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 
/**
 * @swagger
 * /cadastro:
 *   get:
 *     summary: Retorna todos os cadastros
 *     responses:
 *       '200':
 *         description: OK
 *   post:
 *     summary: Cria um novo cadastro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: nome do cadastro
 *               descricao:
 *                 type: integer
 *                 description: descricao do cadastro
 *             example:
 *               nome: João da Silva
 *               descricao: 30
 *     responses:
 *       '200':
 *         description: OK
 *
 * /cadastro/{id}:
 *   put:
 *     summary: Atualiza um cadastro existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           description: ID do cadastro a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Novo nome do cadastro
 *               descricao:
 *                 type: integer
 *                 description: Nova descricao do cadastro
 *             example:
 *               nome: José da Silva
 *               descricao: 35
 *     responses:
 *       '204':
 *         description: No Content
 *   delete:
 *     summary: Deleta um cadastro existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           description: ID do cadastro a ser deletado
 *     responses:
 *       '204':
 *         description: No Content
 */
 
//exemplo: /cadastro?nome=João
 
app.get('/cadastro', async (req, res) => {
  try {
    const { nome } = req.query;
    let query = 'SELECT * FROM cadastro';
    let params = [];
   
    if (nome) {
      query += ' WHERE nome LIKE ?';
      params.push(`%${nome}%`);
    }
 
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao recuperar cadastros:", error);
    res.status(500).send("Erro ao recuperar cadastros");
  }
});
 
app.post('/cadastro', async (req, res) => {
  try {
    const { cpf, nome, idade, cep, endereco } = req.body;
    const [cadastro] = await pool.query('INSERT INTO cadastro (cpf, nome, idade, cep, endereco) VALUES (?, ?, ?, ?, ?)', [cpf, nome, idade, cep, endereco]);
    res.json({ id: cadastro.insertId, cpf:cpf ,nome:nome, idade:idade, cep:cep, endereco:endereco});
  } catch (error) {
    console.error("Erro ao criar cadastro:", error);
    res.status(500).send("Erro ao criar cadastro");
  }
});
 
app.put('/cadastro/:id', async (req, res) => {
  try {
    const { cpf, nome, idade, cep, endereco } = req.body;
    const { id } = req.params;
    await pool.query('UPDATE cadastro SET cpf = ?, nome = ?, idade = ?, cep = ?, endereco = ? WHERE id = ?', [cpf, nome, idade, cep, endereco, id]);
    res.status(200).json({ id: id, cpf: cpf, nome: nome, idade: idade, cep: cep, endereco: endereco });
  } catch (error) {
    console.error("Erro ao atualizar cadastro:", error);
    res.status(500).send("Erro ao atualizar cadastro");
  }
});
 
app.delete('/cadastro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cadastro WHERE id = ?', [id]);
    res.status(200).json({ id: Number(id) });
  } catch (error) {
    console.error("Erro ao deletar cadastro:", error);
    res.status(500).send("Erro ao deletar cadastro");
  }
});
 
app.get('/cadastro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM cadastro WHERE id = ?', [id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar cadastro:", error);
    res.status(500).send("Erro ao buscar cadastro");
  }
});
 
const server = app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
 
// Mantém o servidor rodando mesmo se ocorrer um erro
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
});
 
process.on('unhandledRejection', (err) => {
  console.error('Rejeição não tratada:', err);
});
