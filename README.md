# Copiloto Dev

Planner pessoal para rotina de programacao com priorizacao inteligente, distribuicao semanal de tarefas e acompanhamento gamificado.

## Visao Geral

O **Copiloto Dev** foi pensado para transformar uma lista solta de atividades em um plano de execucao mais logico para quem programa no dia a dia. Em vez de exigir configuracao complexa, o app recebe um backlog simples em linguagem natural e monta:

- uma leitura resumida da semana;
- uma ordem de prioridade;
- um roteiro por fases;
- uma agenda diaria por sessoes;
- um painel gamificado de progresso.

O foco do projeto e ser um **assistente virtual de rotina de programacao**, com visual de painel moderno e uso direto.

## O Que o App Faz

- Recebe tarefas em texto livre, uma por linha.
- Identifica automaticamente o tipo da atividade, como `feature`, `bugfix`, `review`, `test`, `refactor`, `study` ou `deploy`.
- Estima o peso de cada tarefa com base em urgencia, risco, profundidade tecnica e chance de ganho rapido.
- Reordena o backlog de forma inteligente.
- Quebra a semana em fases de execucao.
- Distribui as tarefas nos dias disponiveis conforme a quantidade de sessoes por dia.
- Mostra uma tabela diaria com janela sugerida e status de execucao.
- Salva o plano no navegador para continuar de onde parou.
- Gamifica o andamento com XP, nivel, streak e badges.

## Como Funciona a Inteligencia do Planner

O planner usa heuristicas simples, mas praticas, para sugerir uma rotina mais inteligente.

### 1. Leitura das tarefas

Cada linha digitada pelo usuario e analisada por palavras-chave. O sistema tenta inferir o tipo da tarefa com base em termos como:

- `corrigir`, `erro`, `falha` -> correcao
- `deploy`, `release`, `producao` -> deploy
- `review`, `pr`, `pull request` -> revisao
- `refator`, `organizar`, `migrar` -> refactor
- `estudar`, `documentacao`, `poc` -> estudo
- `criar`, `implementar`, `endpoint` -> feature

### 2. Calculo de prioridade

A prioridade nao e aleatoria. Ela considera:

- urgencia percebida;
- potencial de bloqueio para outras tarefas;
- risco tecnico;
- esforco estimado;
- oportunidade de quick wins.

### 3. Distribuicao da semana

Depois de ordenar o backlog, o app:

- separa a semana em fases;
- limita o plano pela quantidade de sessoes por dia;
- evita concentrar peso demais de forma burra;
- sugere a melhor janela para executar cada item.

### 4. Execucao e progresso

Ao marcar tarefas como concluidas, o sistema recalcula:

- percentual de progresso;
- XP acumulado;
- nivel atual;
- meta diaria;
- badges desbloqueadas.

## Fluxo de Uso

1. Informe o projeto ou contexto.
2. Descreva o objetivo da semana.
3. Cole as atividades, uma por linha.
4. Defina prazo, ritmo e quantidade de sessoes diarias.
5. Gere o plano.
6. Acompanhe a execucao na tela `Mapa de execucao`.
7. Marque o que foi feito para atualizar o painel.

## Estrutura do Projeto

```text
planner-app/
|-- index.html
|-- styles.css
|-- assets/
|   |-- copiloto-dev-icon.ico
|   `-- copiloto-dev-icon.png
`-- scripts/
    |-- constants.js
    |-- utils.js
    |-- storage.js
    |-- gamification.js
    |-- planner-engine.js
    |-- render.js
    `-- main.js
```

### Responsabilidade dos Arquivos

- `index.html`: estrutura da interface e pontos de montagem do app.
- `styles.css`: visual do dashboard, layout, estados e componentes.
- `scripts/constants.js`: regras de palavras-chave, labels, pesos e XP.
- `scripts/utils.js`: utilitarios de data, parsing e formatacao.
- `scripts/storage.js`: persistencia local com `localStorage`.
- `scripts/gamification.js`: calculo de XP, nivel, streak e badges.
- `scripts/planner-engine.js`: motor de analise, priorizacao e distribuicao das tarefas.
- `scripts/render.js`: renderizacao do painel, agenda, tabela diaria e metricas.
- `scripts/main.js`: eventos da interface e sincronizacao do estado.

## Tecnologias

- `HTML5`
- `CSS3`
- `JavaScript vanilla`
- `localStorage` para persistencia local

Nao existe backend neste momento. O app roda inteiramente no navegador.

## Como Executar

Como o projeto e estatico, voce pode usar de duas formas:

### Opcao 1. Abrir direto no navegador

Abra o arquivo `index.html`.

### Opcao 2. Servir localmente

Use qualquer servidor estatico local, como Live Server no VS Code, para abrir a pasta do projeto em um endereco `http://localhost`.

## Estado Atual do Projeto

Hoje o planner ja entrega:

- entrada simples para montar a semana;
- visao separada entre planejamento e execucao;
- painel visual mais moderno;
- tabela diaria de tarefas;
- acompanhamento gamificado;
- persistencia local do plano.

## Limitacoes Atuais

Alguns pontos ainda podem evoluir para deixar o planner mais forte como planner de programacao:

- nao entende dependencias reais entre tarefas;
- ainda nao diferencia contexto tecnico com profundidade, como backend, frontend, infra ou revisao arquitetural;
- nao faz replanejamento automatico quando a semana sai do previsto;
- nao possui sincronizacao em nuvem;
- nao tem historico de semanas anteriores.

## Melhorias Futuras

- dependencias entre tarefas;
- visoes `Hoje`, `Proxima` e `Depois`;
- replanejamento automatico;
- filtros por energia, contexto e tipo de sessao;
- historico de performance semanal;
- exportacao de relatorios da rotina.

## Objetivo do Produto

Mais do que um organizador generico, este projeto busca ser um **copiloto pessoal para produtividade tecnica**, ajudando a transformar backlog confuso em execucao clara.

## Autor

Projeto mantido por [kyslDEV](https://github.com/kyslDEV).
