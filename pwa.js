(() => {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }

  const repoBase = "/my-apps/";
  const appBase = location.pathname.startsWith(repoBase) ? repoBase : "/";

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${appBase}sw.js`, { scope: appBase })
      .catch((error) => {
        console.warn("Service worker registration failed", error);
      });
  });
})();
