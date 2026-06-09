(function initGamification(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};
  const { typeXp } = app.constants;

  app.gamification = {
    calculate(state) {
      const doneTasks = state.tasks.filter((task) => task.done);
      const totalTasks = state.tasks.length;
      const totalXp = doneTasks.reduce((sum, task) => {
        const base = typeXp[task.type] || typeXp.general;
        return sum + base + (task.effort - 1) * 10 + (task.blockerScore > 0 ? 8 : 0);
      }, 0);

      const level = Math.max(1, Math.floor(totalXp / 120) + 1);
      const currentLevelXp = totalXp % 120;
      const levelProgress = Math.round((currentLevelXp / 120) * 100);
      const missionTarget = Math.min(Math.max(2, state.data.dailyBlocks), totalTasks || 1);
      const missionDone = Math.min(doneTasks.length, missionTarget);

      const heavyDone = doneTasks.filter((task) => task.effort >= 3).length;
      const quickWinsDone = doneTasks.filter((task) => task.quickWinScore > 0).length;
      const riskyDone = doneTasks.filter((task) => task.riskScore > 0).length;

      return {
        totalXp,
        level,
        levelProgress,
        missionTarget,
        missionDone,
        streak: missionDone,
        badges: [
          {
            title: "Primeiro commit",
            unlocked: doneTasks.length >= 1,
            text: "voce saiu do zero e colocou a semana em movimento",
          },
          {
            title: "Modo foco",
            unlocked: heavyDone >= 1,
            text: "voce encarou pelo menos uma tarefa pesada",
          },
          {
            title: "Limpa backlog",
            unlocked: quickWinsDone >= 2,
            text: "voce removeu pequenas pendencias que travavam o fluxo",
          },
          {
            title: "Sem medo de producao",
            unlocked: riskyDone >= 1,
            text: "voce concluiu algo com risco tecnico maior",
          },
          {
            title: "Semana fechada",
            unlocked: totalTasks > 0 && doneTasks.length === totalTasks,
            text: "voce fechou todas as tarefas do plano",
          },
        ],
      };
    },
  };
})(window);
