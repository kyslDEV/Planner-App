(function initUtils(global) {
  const app = global.CopilotoDev = global.CopilotoDev || {};

  app.utils = {
    parseLines(value) {
      return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    },

    setDefaultDeadline(input) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      input.value = nextWeek.toISOString().slice(0, 10);
    },

    daysBetween(today, deadline) {
      const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return Math.max(diff + 1, 1);
    },

    addDays(baseDate, daysToAdd) {
      const next = new Date(baseDate);
      next.setDate(next.getDate() + daysToAdd);
      return next;
    },

    formatDate(date) {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(date);
    },
  };
})(window);
