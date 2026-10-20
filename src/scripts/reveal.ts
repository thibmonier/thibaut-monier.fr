// Apparition au défilement des éléments `.reveal` (masqués par global.css tant que `.is-revealed` est absent).
const REVEALED = 'is-revealed';
const pending = [...document.querySelectorAll<HTMLElement>(`.reveal:not(.${REVEALED})`)];

const show = (el: Element): void => el.classList.add(REVEALED);

if (!('IntersectionObserver' in window)) {
  pending.forEach(show);
} else {
  // Déjà visibles au chargement : affichés sans attendre le premier rappel de l'observateur.
  for (const el of pending) {
    if (el.getBoundingClientRect().top < window.innerHeight) show(el);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.1 },
  );
  for (const el of pending) if (!el.classList.contains(REVEALED)) observer.observe(el);
}
