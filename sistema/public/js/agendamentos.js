// ============================================================
// public/js/agendamentos.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// Requisitos envolvidos: RF-19 (listar ordenado, com dados de
// tutor e pet) e RF-20 (atualizar data de um agendamento).
//
// Sugestão de estrutura por linha da tabela: cada linha mostra
// os dados do agendamento, e na coluna "Ações" um campo de data
// (input type="date", já preenchido com a data atual do
// agendamento) mais um botão "Salvar" - ao clicar, atualiza
// aquele agendamento. Isso evita precisar de modal/popup.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela e formatar datas
//   - exemplo-fetch.js       : GET, PUT e os demais tipos de fetch
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-agendamentos');
const tabela = document.getElementById('tabela-agendamentos');
const mensagemAgendamentos = document.getElementById('mensagem-agendamentos');

inicializar();

async function inicializar() {
    await carregarAgendamentos();
}

// ------------------------------------------------------------
// RF-19: listar agendamentos ordenados por data, com dados de
// pet e tutor (join)
// ------------------------------------------------------------
async function carregarAgendamentos() {
    try {
        // TODO: fetch GET /api/agendamentos
        // Trate resposta.status === 401 (redirecionar para /login.html)
        // Pegue o JSON e chame renderizarAgendamentos(agendamentos)

        await fetch('/api/agendaemntos/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamentos)
        });

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao salvar.');
            return;
        }

        formTutor.reset();
        tutorIdInput.value = '';
        btnCancelar.classList.add('d-none');
        await carregarTutores();

        renderizarAgendamentos(agendamentos)


    } catch (erro) {
        mensagemAgendamentos.textContent = 'Erro ao carregar agendamentos.';
        console.error(erro);
    }
}

function renderizarAgendamentos(agendamentos) {
    // TODO: se a lista estiver vazia, mantenha a mensagem visível
    // e a tabela escondida (classe d-none)

    if (livros.length === 0) {
        mensagemAgendamentos.textContent = 'Nenhum agendamento encontrado.';
        mensagemAgendamentos.classList.remove('d-none');
        tabela.classList.add('d-none');
        corpoTabela.innerHTML = '';
        return;
    }

    mensagemAgendamentos.classList.add('d-none');
    tabela.classList.remove('d-none');

    corpoTabela.innerHTML = livros.map(livro => {
        return `
            <tr>
                <td>${formatarData(agendamento.data)}</td>
                <td>${agendamento.pet_nome|| '-'}</td>
                <td>${agendamento.pet_especie|| '-'}</td>
                <td>${agendamento.tutor_nome|| '-'}</td>
                <td>${agendamento.tutor_telefone|| '-'}</td>
                <td>${agendamento.observacao|| '-'}</td>  
                <input type="date" value="DATA NO FORMATO AAAA-MM-DD" data-id="${agendamento.id}">              
                <td>
                    
                    <button data-id="${agendamento.id}">Salvar</button>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.btn-salvar').forEach((botao) => {
        botao.addEventListener('click', () => {
            const agendamento = agendamentos.find((a) => a.id == botao.dataset.id);
            preencherFormularioParaEdicao(agendamento);
        });
    });


    // TODO: caso contrário, esconda a mensagem, mostre a tabela, e
    // monte uma linha <tr> para cada agendamento dentro de
    // corpoTabela.innerHTML, com as colunas: data, nome do pet,
    // espécie, nome do tutor, telefone do tutor, observação, e uma
    // célula de ação contendo:
    //   <input type="date" value="DATA NO FORMATO AAAA-MM-DD" data-id="${agendamento.id}">
    // ATENÇÃO: a data chega do banco como "2026-09-20T03:00:00.000Z", e o
    // <input type="date"> só aceita "2026-09-20". Veja o item F de
    // exemplos/exemplo-montar-tela.js antes de preencher o value.
    //   <button data-id="${agendamento.id}">Salvar</button>
    //
    // Depois de montar o innerHTML, adicione os addEventListener
    // nos botões "Salvar" recém-criados (eles não existem até esse
    // innerHTML ser inserido).
}

// ------------------------------------------------------------
// RF-20: atualizar a data de um agendamento
// Chamada pelos botões "Salvar" criados em renderizarAgendamentos()
// ------------------------------------------------------------
async function atualizarDataAgendamento(id, novaData) {
    try {

        await fetch('/api/agendamentos/{id}', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pet)
        });

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao salvar.');
            return;
        }

        formPet.reset();
        tutorIdInput.value = '';
        btnCancelar.classList.add('d-none');
        await carregarTutores();

        // TODO: fetch PUT /api/agendamentos/{id}, enviando
        // { data_agendamento: novaData } como JSON no body.
        // Confira resposta.ok e avise o usuário (alert ou mensagem)
        // se deu certo ou não.

    } catch (erro) {
        alert('Erro ao atualizar data do agendamento.');
        console.error(erro);
    }
}

function dataParaInput(valor) {
    if (!valor) return '';
    return valor.substring(0, 10);            // "2026-09-20"
}

// Para mostrar na tela no padrão brasileiro: "20/09/2026".
function formatarData(valor) {
    if (!valor) return '-';
    return dataParaInput(valor).split('-').reverse().join('/');
}
