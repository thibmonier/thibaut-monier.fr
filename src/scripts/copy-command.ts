for (const root of document.querySelectorAll<HTMLElement>('[data-copy-root]')) {
  const button = root.querySelector('button');
  const code = root.querySelector('code');
  const status = root.querySelector('[role="status"]');
  if (!button || !code || !status || !navigator.clipboard) continue;
  button.hidden = false;
  button.addEventListener('click', () => {
    navigator.clipboard.writeText(code.textContent ?? '').then(
      () => (status.textContent = root.dataset.copied ?? ''),
      () => (status.textContent = root.dataset.failed ?? ''),
    );
  });
}
