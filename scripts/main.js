(function initMain(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};
  const { dom, utils, storage, engine, render } = app;

  let currentState = null;

  function syncTask(taskId, done) {
    if (!currentState) return;

    const targetTask = currentState.tasks.find((task) => task.id === taskId);
    if (!targetTask) return;

    targetTask.done = done;
    storage.saveState(currentState);
    render.renderPlan(currentState, syncTask);
  }

  function mountState(state) {
    currentState = state;
    storage.saveState(currentState);
    render.renderPlan(currentState, syncTask);
  }

  function showPlanView() {
    render.setView("plan", Boolean(currentState));
  }

  function showExecutionView() {
    if (!currentState) return;
    render.setView("execution", true);
  }

  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    mountState(engine.generateState(engine.collectFormData(dom.form)));
  });

  dom.resetButton.addEventListener("click", () => {
    currentState = null;
    storage.clearState();
    dom.form.reset();
    utils.setDefaultDeadline(dom.form.deadline);
    render.resetView();
  });

  dom.planViewButton.addEventListener("click", showPlanView);
  dom.executionViewButton.addEventListener("click", showExecutionView);
  dom.backToPlanButton.addEventListener("click", showPlanView);

  const previousState = storage.loadState();
  if (previousState) {
    currentState = previousState;
    dom.form.project.value = previousState.data.project || "";
    dom.form.goal.value = previousState.data.goal || "";
    dom.form.activities.value = previousState.data.activities || "";
    dom.form.deadline.value = previousState.data.deadline || "";
    dom.form.dailyBlocks.value = previousState.data.dailyBlocks || 3;
    dom.form.pace.value = previousState.data.pace || "equilibrado";
    dom.form.workType.value = previousState.data.workType || "feature";
    dom.form.constraints.value = previousState.data.constraints || "";
    render.renderPlan(currentState, syncTask);
    render.setView("plan", true);
  } else {
    utils.setDefaultDeadline(dom.form.deadline);
    render.resetView();
  }
})(window);
