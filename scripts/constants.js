(function initConstants(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};

  app.constants = {
    STORAGE_KEY: "planner-dev-state-v4",
    keywordRules: [
      { type: "bugfix", words: ["bug", "erro", "corrigir", "fix", "quebra", "falha", "ajustar"] },
      { type: "deploy", words: ["deploy", "publicar", "pipeline", "rollback", "release", "producao"] },
      { type: "review", words: ["review", "revisar", "pr", "pull request", "code review"] },
      { type: "test", words: ["teste", "testar", "regressao", "qa", "validar"] },
      { type: "refactor", words: ["refator", "limpar", "organizar", "migrar", "melhorar estrutura"] },
      { type: "study", words: ["estudar", "aprender", "ler", "curso", "documentacao", "pesquisar", "poc"] },
      { type: "feature", words: ["criar", "implementar", "adicionar", "construir", "subir", "novo", "endpoint", "fluxo"] },
    ],
    urgencyWords: ["urgente", "hoje", "critico", "asap", "prazo", "bloqueia", "bloqueado", "cliente", "producao"],
    deepWorkWords: ["arquitet", "refator", "migr", "dashboard", "autentic", "pagamento", "checkout", "infra", "endpoint", "integra"],
    quickWinWords: ["texto", "copy", "ajuste", "css", "botao", "label", "readme", "config", "lint"],
    riskyWords: ["auth", "login", "autentic", "pagamento", "checkout", "deploy", "migr", "banco", "db", "producao"],
    nextActionByType: {
      bugfix: "reproduzir o problema e isolar a causa",
      deploy: "fechar um checklist curto antes de publicar",
      review: "abrir o diff e anotar o que muda no comportamento",
      test: "definir o caso principal antes de validar tudo",
      refactor: "cortar a menor parte segura para mexer primeiro",
      study: "transformar o estudo em um experimento pequeno",
      feature: "definir o menor incremento que ja entrega valor",
      general: "quebrar em um primeiro passo que caiba em uma sessao",
    },
    typeLabel: {
      bugfix: "correcao",
      deploy: "deploy",
      review: "revisao",
      test: "teste",
      refactor: "refactor",
      study: "estudo",
      feature: "feature",
      general: "tarefa",
    },
    typeXp: {
      bugfix: 35,
      deploy: 45,
      review: 20,
      test: 25,
      refactor: 40,
      study: 22,
      feature: 38,
      general: 20,
    },
  };
})(window);
