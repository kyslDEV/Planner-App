(function initRender(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};
  const { utils, gamification } = app;

  app.dom = {
    form: document.getElementById("plannerForm"),
    resetButton: document.getElementById("resetButton"),
    planViewButton: document.getElementById("planViewButton"),
    executionViewButton: document.getElementById("executionViewButton"),
    backToPlanButton: document.getElementById("backToPlanButton"),
    inputPanel: document.querySelector('[data-view="plan"]'),
    outputPanel: document.querySelector('[data-view="execution"]'),
    emptyState: document.getElementById("emptyState"),
    planContent: document.getElementById("planContent"),
    summaryTitle: document.getElementById("summaryTitle"),
    summaryText: document.getElementById("summaryText"),
    timelineHint: document.getElementById("timelineHint"),
    scheduleHint: document.getElementById("scheduleHint"),
    priorityHint: document.getElementById("priorityHint"),
    gameHint: document.getElementById("gameHint"),
    timeline: document.getElementById("timeline"),
    schedule: document.getElementById("schedule"),
    priorityBoard: document.getElementById("priorityBoard"),
    focusMetric: document.getElementById("focusMetric"),
    doneMetric: document.getElementById("doneMetric"),
    xpMetric: document.getElementById("xpMetric"),
    levelMetric: document.getElementById("levelMetric"),
    streakMetric: document.getElementById("streakMetric"),
    missionMetric: document.getElementById("missionMetric"),
    missionNote: document.getElementById("missionNote"),
    levelProgressMetric: document.getElementById("levelProgressMetric"),
    levelProgressBar: document.getElementById("levelProgressBar"),
    badgeBoard: document.getElementById("badgeBoard"),
    dailyTableBody: document.getElementById("dailyTableBody"),
    taskTemplate: document.getElementById("taskTemplate"),
  };

  function renderBadgeBoard(dom, game) {
    dom.badgeBoard.replaceChildren();

    game.badges.forEach((badge) => {
      const item = document.createElement("article");
      item.className = `badge-item${badge.unlocked ? " unlocked" : ""}`;
      item.innerHTML = `
        <strong>${badge.title}</strong>
        <span>${badge.text}</span>
      `;
      dom.badgeBoard.appendChild(item);
    });
  }

  function renderPriorityBoard(dom, priority) {
    dom.priorityBoard.replaceChildren();

    const columns = [
      { title: "Faz agora", items: priority.now, hint: "o que mais destrava seu caminho hoje" },
      { title: "Vem depois", items: priority.next, hint: "entra assim que a frente principal andar" },
      { title: "Pode esperar", items: priority.later, hint: "fica fora do seu foco principal por enquanto" },
    ].filter((column) => column.items.length > 0);

    columns.forEach((column) => {
      const card = document.createElement("article");
      card.className = "priority-card";
      card.innerHTML = `
        <p class="priority-title">${column.title}</p>
        <p class="priority-hint">${column.hint}</p>
      `;

      const list = document.createElement("div");
      list.className = "priority-list";

      column.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "priority-item";
        row.innerHTML = `
          <strong>${item.title}</strong>
          <span>${item.reasoning[0]}. Proxima acao: ${item.nextAction}</span>
        `;
        list.appendChild(row);
      });

      card.appendChild(list);
      dom.priorityBoard.appendChild(card);
    });
  }

  function renderDailyTable(dom, schedule) {
    dom.dailyTableBody.replaceChildren();

    schedule.forEach((day) => {
      day.tasks.forEach((task, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index === 0 ? utils.formatDate(new Date(day.date)) : ""}</td>
          <td>${task.title}</td>
          <td><span class="table-type">${task.typeLabel}</span></td>
          <td>${task.assignedBlocks}</td>
          <td>${task.preferredWindow}</td>
          <td><span class="table-status${task.done ? " done" : ""}">${task.done ? "feito" : "pendente"}</span></td>
        `;
        dom.dailyTableBody.appendChild(row);
      });
    });
  }

  function createTaskNode(dom, task, onToggle) {
    const fragment = dom.taskTemplate.content.cloneNode(true);
    const label = fragment.querySelector(".task-item");
    const checkbox = fragment.querySelector(".task-check");
    const copy = fragment.querySelector(".task-copy");
    const tag = fragment.querySelector(".task-tag");

    checkbox.checked = task.done;
    copy.textContent = task.title;

    if (task.assignedBlocks) {
      tag.textContent = `${task.typeLabel} - ${task.assignedBlocks} sessao(oes) - ${task.preferredWindow}${task.segmentLabel ? ` - ${task.segmentLabel}` : ""}`;
    } else {
      tag.textContent = `${task.typeLabel} - ${task.effortLabel} - ${task.reasoning[0]}`;
    }

    if (task.done) {
      label.classList.add("done");
    }

    checkbox.addEventListener("change", () => {
      onToggle(task.id, checkbox.checked);
    });

    return fragment;
  }

  app.render = {
    setView(view, hasState) {
      const dom = app.dom;
      const showPlan = view === "plan";
      const showExecution = view === "execution" && hasState;

      dom.inputPanel.classList.toggle("hidden-panel", !showPlan);
      dom.outputPanel.classList.toggle("hidden-panel", !showExecution);
      dom.planViewButton.classList.toggle("active", showPlan);
      dom.executionViewButton.classList.toggle("active", showExecution);
      dom.executionViewButton.disabled = !hasState;
    },

    resetView() {
      const { emptyState, planContent, focusMetric, doneMetric, xpMetric, levelMetric } = app.dom;
      emptyState.classList.remove("hidden");
      planContent.classList.add("hidden");
      focusMetric.textContent = "0 sessoes";
      doneMetric.textContent = "0%";
      xpMetric.textContent = "0 XP";
      levelMetric.textContent = "Nivel 1";
      this.setView("plan", false);
    },

    renderPlan(state, onToggle) {
      const dom = app.dom;
      dom.emptyState.classList.add("hidden");
      dom.planContent.classList.remove("hidden");
      this.setView("execution", true);

      const totalTasks = state.tasks.length;
      const doneTasks = state.tasks.filter((task) => task.done).length;
      const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

      dom.summaryTitle.textContent = state.data.goal;
      dom.summaryText.textContent = `${state.summary}${state.data.constraints ? ` Considerando: ${state.data.constraints}.` : ""}`;
      dom.timelineHint.textContent = `${state.phases.length} faixa(s) da semana`;
      dom.scheduleHint.textContent = `${state.schedule.length} dia(s) com ordem sugerida`;
      dom.priorityHint.textContent = "ordem pensada por impacto e bloqueio";
      dom.gameHint.textContent = "ritmo medido por execucao real";
      dom.focusMetric.textContent = `${state.data.dailyBlocks} sessoes`;
      dom.doneMetric.textContent = `${progress}%`;

      state.game = gamification.calculate(state);
      dom.xpMetric.textContent = `${state.game.totalXp} XP`;
      dom.levelMetric.textContent = `Nivel ${state.game.level}`;
      dom.streakMetric.textContent = `${state.game.streak}`;
      dom.missionMetric.textContent = `${state.game.missionDone}/${state.game.missionTarget}`;
      dom.missionNote.textContent = state.game.missionDone >= state.game.missionTarget
        ? "missao batida, pode subir o nivel"
        : "complete a meta do dia para manter o ritmo";
      dom.levelProgressMetric.textContent = `${state.game.levelProgress}%`;
      dom.levelProgressBar.style.width = `${state.game.levelProgress}%`;

      renderPriorityBoard(dom, state.priority);
      renderBadgeBoard(dom, state.game);
      renderDailyTable(dom, state.schedule);

      dom.timeline.replaceChildren();
      dom.schedule.replaceChildren();

      state.phases.forEach((phase) => {
        const card = document.createElement("article");
        card.className = "timeline-card";
        card.innerHTML = `
          <div class="phase-head">
            <h4 class="phase-title">${phase.name}</h4>
            <span class="phase-range">${phase.range}</span>
          </div>
        `;

        const taskList = document.createElement("div");
        taskList.className = "task-list";
        phase.tasks.forEach((task) => taskList.appendChild(createTaskNode(dom, task, onToggle)));
        card.appendChild(taskList);
        dom.timeline.appendChild(card);
      });

      state.schedule.forEach((day) => {
        const card = document.createElement("article");
        card.className = "day-card";
        card.innerHTML = `
          <div class="day-head">
            <h4 class="day-title">${utils.formatDate(new Date(day.date))}</h4>
            <span class="day-subtitle">${day.usedBlocks}/${day.capacity} sessoes</span>
          </div>
        `;

        const taskList = document.createElement("div");
        taskList.className = "task-list";
        day.tasks.forEach((task) => taskList.appendChild(createTaskNode(dom, task, onToggle)));
        card.appendChild(taskList);
        dom.schedule.appendChild(card);
      });
    },
  };
})(window);
