// ============================================================
// routes/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊS (ALUNO DESENVOLVE).
//
// A estrutura de cada rota (o "molde" com try/catch/finally e a
// conexão com o banco) já está pronta, seguindo o mesmo padrão
// usado em routes/auth.js. O que falta em cada uma é a lógica
// específica (marcada com TODO).
//
// Lembretes importantes:
//   - Cada rota abaixo já vem protegida pelo middleware
//     verificarSessao (segundo parâmetro) - vocês não precisam
//     mexer nisso, só saber que é por isso que o sistema exige
//     login para usar essas rotas.
//   - O CPF do tutor deve ser CRIPTOGRAFADO ao salvar/atualizar, e
//     DESCRIPTOGRAFADO ao listar/exibir - use as funções prontas em
//     utils/crypto-utils.js (criptografarCPF / descriptografarCPF)
//
// Veja o GUIA_DE_DESENVOLVIMENTO.md para um roteiro passo a passo
// de cada uma dessas funcionalidades.
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { criptografarCPF, descriptografarCPF } from '../utils/crypto-utils.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();

// ─────────────────────────────────────────
// GET / -> listar tutores (RF-12)
// GET /?busca=termo -> listar tutores filtrados (RF-14)
// ─────────────────────────────────────────
router.get('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    
        // TODO: req.query.busca contém o termo digitado (se houver).
        // Monte a query de acordo: se não houver busca, traga todos
        // os tutores; se houver, filtre pelo nome.

        try {
            await client.connect();
    
            if (termoBusca) {
                // Busca: usamos ILIKE para não diferenciar maiúsculas
                // de minúsculas, e "%" antes e depois do termo para
                // encontrar a palavra em qualquer parte do título.
                // O "$1" evita SQL Injection (nunca concatene o texto
                // digitado direto dentro da string da query).
                resultado = await client.query(`
                    SELECT id, nome, cpf, telefone 
                    FROM tutores 
                    WHERE nome ILIKE '%' || $1 || '%' 
                    ORDER BY nome`,
                 [termoBusca] );
            } else {
                resultado = await client.query(`
                    SELECT id, nome, cpf, telefone 
                    FROM tutores 
                    ORDER BY nome 
                `);
            }
    

        const resultado = await client.query('SELECT * FROM tutores'); // TODO: ajustar

        // TODO: antes de responder, percorra resultado.rows e troque
        // o campo "cpf" de cada tutor pelo valor descriptografado
        // (descriptografarCPF), senão o CPF aparece ilegível na tela.

        const tutoresDescriptografados = resultado.rows.map(tutor => ({
            ...tutor,
            cpf: tutor.cpf ? descriptografarCPF(tutor.cpf) : tutor.cpf
          }));
      
        res.json(tutoresDescriptografados);
      
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// POST / -> inserir novo tutor (RF-15)
// ─────────────────────────────────────────
router.post('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { nome, cpf, telefone } = req.body;

        // TODO: validar campos obrigatórios (nome, cpf)
        if (!nome || !cpf ) {
            return res.status(400).json({ erro: 'Nome e CPF  são obrigatórios.' });
        }

        // TODO: criptografar o CPF antes de salvar
        // const cpfCriptografado = criptografarCPF(cpf);
        const cpfCriptografado = criptografarCPF(cpf);


        // TODO: montar o INSERT usando client.query(...), com
        // RETURNING * para devolver o registro criado
        const resultado = await client.query(`
            INSERT INTO livros (nome, cpf, telefone)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [nome, cpfCriptografado, telefone]);

        res.status(201).json(resultado.rows[0]); // TODO: substituir pelo registro criado
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// PUT /:id -> editar tutor existente (RF-17)
// ─────────────────────────────────────────
router.put('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;
        const { nome, cpf, telefone } = req.body;

        // TODO: criptografar o CPF recebido antes de atualizar
        const cpfCriptografado = criptografarCPF(cpf);


        // TODO: montar o UPDATE usando client.query(...), filtrando
        // por WHERE id = $... (use req.params.id)
        const resultado = await client.query(`
            UPDATE tutores
            SET nome = $1, cpf = $2, telefone = $3
            WHERE id = $4
            RETURNING *
        `, [nome, cpfCriptografado, telefone, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: 'Tutor atualizado com sucesso.'}); // TODO: substituir pela confirmação/registro atualizado
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// DELETE /:id -> excluir tutor (RF-13)
// ─────────────────────────────────────────
router.delete('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;

        // TODO: montar o DELETE usando client.query(...), filtrando
        // por WHERE id = $1

        const resultado = await client.query(
            'DELETE FROM tutores WHERE id = $1 RETURNING nome',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: 'Tutor removido com sucesso.' }); // ajuste se quiser
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
