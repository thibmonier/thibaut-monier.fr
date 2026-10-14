// Initialisation du thème, chargée de façon bloquante dans <head> pour éviter tout flash (ADR-0010).
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);
  } catch {
    /* stockage indisponible : la préférence système s'applique via CSS */
  }
})();
