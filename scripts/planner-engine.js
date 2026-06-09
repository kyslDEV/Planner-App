(function initPlannerEngine(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};
  const { utils, constants, gamification } = app;

  function inferTaskType(text, fallbackType) {
    const lower = text.toLowerCase();

    for (const rule of constants.keywordRules) {
      if (rule.words.some((word) => lower.includes(word))) {
        return rule.type;
      }
    }

    return fallbackType || "general";
  }

  function countMatches(text, words) {
    const lower = text.toLowerCase();
    return words.reduce((total, word) => total + (lower.includes(word) ? 1 : 0), 0);
  }

  function estimateTaskSize(text, type, pace) {
    let score = 1;
    const lower = text.toLowerCase();

    if (text.length > 40) score += 1;
    if (countMatches(lower, constants.deepWorkWords) > 0) score += 1;
    if (type === "feature" || type === "refactor") score += 1;
    if (type === "deploy" || type === "study") score += 0.5;
    if (countMatches(lower, constants.quickWinWords) > 0) score -= 1;

    if (pace === "leve") score -= 0.5;
    if (pace === "intenso") score += 0.5;

    return Math.max(1, Math.min(Math.round(score), 3));
  }

  function preferredWindow(type, effort, urgencyScore) {
    if (urgencyScore >= 2) return "assim que abrir o dia";
    if (effort >= 3) return "primeira sessao de foco";
    if (type === "review" || type === "test") return "entre blocos pesados";
    if (type === "deploy") return "mais para o fim do dia";
    return "quando voce estiver aquecido";
  }

  function buildReasoning(type, urgencyScore, effort, blockerScore, quickWinScore) {
    const reasons = [];

    if (urgencyScore >= 2) reasons.push("tem sinal forte de urgencia");
    if (blockerScore >= 1) reasons.push("parece bloquear outras frentes");
    if (effort >= 3) reasons.push("pede foco profundo");
    if (type === "deploy") reasons.push("merece validacao antes de publicar");
    if (type === "bugfix") reasons.push("corrigir isso tende a reduzir atrito rapido");
    if (quickWinScore >= 1 && effort === 1) reasons.push("e um ganho rapido");

    return reasons.length > 0 ? reasons : ["vale entrar na fila normal da semana"];
  }

  function analyzeTask(rawTask, fallbackType, pace, index) {
    const type = inferTaskType(rawTask, fallbackType);
    const urgencyScore = countMatches(rawTask, constants.urgencyWords);
    const blockerScore = countMatches(rawTask, ["auth", "login", "checkout", "pagamento", "migr", "deploy", "db", "schema", "cliente"]);
    const quickWinScore = countMatches(rawTask, constants.quickWinWords);
    const riskScore = countMatches(rawTask, constants.riskyWords);
    const effort = estimateTaskSize(rawTask, type, pace);

    let priorityScore = 10;
    priorityScore += urgencyScore * 4;
    priorityScore += blockerScore * 3;
    priorityScore += riskScore * 2;
    priorityScore += effort >= 3 ? 2 : 0;
    priorityScore += quickWinScore > 0 && effort === 1 ? 1 : 0;
    priorityScore -= index * 0.15;

    if (type === "deploy") priorityScore += 2;
    if (type === "bugfix") priorityScore += 2;
    if (type === "review") priorityScore += 1;
    if (type === "study") priorityScore -= 1;

    return {
      id: crypto.randomUUID(),
      title: rawTask.charAt(0).toUpperCase() + rawTask.slice(1),
      rawTask,
      type,
      typeLabel: constants.typeLabel[type] || constants.typeLabel.general,
      effort,
      effortLabel: effort === 1 ? "leve" : effort === 2 ? "media" : "pesada",
      urgencyScore,
      blockerScore,
      quickWinScore,
      riskScore,
      priorityScore,
      preferredWindow: preferredWindow(type, effort, urgencyScore),
      nextAction: `${constants.nextActionByType[type] || constants.nextActionByType.general} em "${rawTask}"`,
      reasoning: buildReasoning(type, urgencyScore, effort, blockerScore, quickWinScore),
      done: false,
    };
  }

  function sortTasksSmart(tasks) {
    return [...tasks].sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      if (b.blockerScore !== a.blockerScore) return b.blockerScore - a.blockerScore;
      if (a.effort !== b.effort) return b.effort - a.effort;
      return a.title.localeCompare(b.title, "pt-BR");
    });
  }

  function buildPriorityBuckets(tasks) {
    const nowCount = Math.min(3, tasks.length);
    const nextCount = Math.min(3, Math.max(tasks.length - nowCount, 0));

    return {
      now: tasks.slice(0, nowCount),
      next: tasks.slice(nowCount, nowCount + nextCount),
      later: tasks.slice(nowCount + nextCount),
    };
  }

  function buildPhases(tasks, startDate, totalDays) {
    const slices = [
      { name: "Destravar", tasks: tasks.slice(0, 2) },
      { name: "Andar com o miolo", tasks: tasks.slice(2, 5) },
      { name: "Fechar pontas", tasks: tasks.slice(5) },
    ].filter((phase) => phase.tasks.length > 0);

    return slices.map((phase, index) => {
      const startOffset = Math.min(index * 2, totalDays - 1);
      const endOffset = Math.min(startOffset + 1, totalDays - 1);

      return {
        ...phase,
        range: `${utils.formatDate(utils.addDays(startDate, startOffset))} a ${utils.formatDate(utils.addDays(startDate, endOffset))}`,
      };
    });
  }

  function chooseBucketForTask(task, buckets, startIndex) {
    let bestBucket = buckets[startIndex] || buckets[buckets.length - 1];
    let bestScore = -Infinity;

    buckets.forEach((bucket, index) => {
      if (bucket.usedBlocks >= bucket.capacity) return;

      let score = 0;
      const free = bucket.capacity - bucket.usedBlocks;

      if (index === startIndex) score += 4;
      if (index <= startIndex + 1) score += 2;
      if (free >= task.effort) score += 3;
      if (task.effort >= 3 && bucket.hasHeavy) score -= 4;
      if (task.type === "deploy" && index < buckets.length - 1) score -= 2;
      if (task.quickWinScore > 0 && free === 1) score += 2;
      if (task.type === "review" || task.type === "test") score += bucket.hasHeavy ? 2 : 0;
      if (task.blockerScore > 0 && index === 0) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestBucket = bucket;
      }
    });

    return bestBucket;
  }

  function buildSchedule(tasks, startDate, totalDays, dailyBlocks) {
    const buckets = Array.from({ length: totalDays }, (_, dayIndex) => ({
      date: utils.addDays(startDate, dayIndex),
      tasks: [],
      usedBlocks: 0,
      capacity: dailyBlocks,
      hasHeavy: false,
    }));

    tasks.forEach((task, taskIndex) => {
      let remaining = task.effort;
      let startIndex = Math.min(taskIndex, buckets.length - 1);
      let part = 1;

      while (remaining > 0) {
        const bucket = chooseBucketForTask(task, buckets, startIndex);
        const available = Math.max(bucket.capacity - bucket.usedBlocks, 1);
        const assignedBlocks = Math.min(remaining, available);

        bucket.tasks.push({
          ...task,
          assignedBlocks,
          segmentLabel: task.effort > 1 ? `parte ${part}` : "",
        });

        bucket.usedBlocks += assignedBlocks;
        if (task.effort >= 3) bucket.hasHeavy = true;

        remaining -= assignedBlocks;
        startIndex = Math.min(buckets.indexOf(bucket) + 1, buckets.length - 1);
        part += 1;
      }
    });

    return buckets.filter((bucket) => bucket.tasks.length > 0);
  }

  function summarizePlan(data, tasks, totalDays) {
    const totalBlocks = tasks.reduce((sum, task) => sum + task.effort, 0);
    const topTask = tasks[0];
    const context = data.project ? ` no contexto de ${data.project}` : "";
    const firstMove = topTask ? `Eu comecaria por "${topTask.title}" porque ${topTask.reasoning[0]}.` : "";

    return `Voce quer destravar ${data.goal}${context}. Li ${tasks.length} tarefa(s) e montei uma sequencia pensando em impacto, bloqueio, risco e peso. Isso deu cerca de ${totalBlocks} sessao(oes) para ${totalDays} dia(s). ${firstMove}`;
  }

  app.engine = {
    collectFormData(form) {
      return {
        project: form.project.value.trim(),
        goal: form.goal.value.trim(),
        activities: form.activities.value.trim(),
        deadline: form.deadline.value,
        dailyBlocks: Number(form.dailyBlocks.value),
        pace: form.pace.value,
        workType: form.workType.value,
        constraints: form.constraints.value.trim(),
      };
    },

    generateState(data) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = new Date(`${data.deadline}T00:00:00`);
      const totalDays = utils.daysBetween(today, deadline);
      const activities = utils.parseLines(data.activities);
      const analyzed = activities.map((activity, index) => analyzeTask(activity, data.workType, data.pace, index));
      const tasks = sortTasksSmart(analyzed).map((task, index) => ({
        ...task,
        suggestedDay: Math.min(index, totalDays - 1),
      }));

      const state = {
        data,
        tasks,
        priority: buildPriorityBuckets(tasks),
        phases: buildPhases(tasks, today, totalDays),
        schedule: buildSchedule(tasks, today, totalDays, data.dailyBlocks),
        summary: summarizePlan(data, tasks, totalDays),
      };

      state.game = gamification.calculate(state);
      return state;
    },
  };
})(window);
