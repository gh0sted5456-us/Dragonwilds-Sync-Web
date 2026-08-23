(() => {
  const triggers = document.querySelectorAll("[data-runeschema-dialog]");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dialog = document.getElementById(trigger.dataset.runeschemaDialog);
      if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    });
  });

  document.querySelectorAll(".runeschema-dialog").forEach((dialog) => {
    dialog.querySelectorAll("[data-runeschema-close]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
})();
