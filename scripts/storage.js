(function initStorage(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};
  const { STORAGE_KEY } = app.constants;

  app.storage = {
    loadState() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    saveState(state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    clearState() {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
})(window);
