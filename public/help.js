/**
 * @fileoverview Help modal utilities
 */

function renderHelpContent(type) {
  const helpContent = document.getElementById('help-content');
  const guide = window.HOME_HARBOR_HELP?.[type];
  if (!guide || !helpContent) return;

  helpContent.innerHTML = `
    <h4 class="text-base font-semibold text-slate-900">${guide.title}</h4>
    ${guide.sections
      .map(
        (section) => `
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p class="text-sm font-semibold text-slate-800">${section.heading}</p>
          <p class="mt-1 text-sm text-slate-600">${section.body}</p>
        </div>
      `
      )
      .join('')}
  `;
}

function openHelp(type) {
  const helpModal = document.getElementById('help-modal');
  const helpTabUser = document.getElementById('help-tab-user');
  const helpTabDev = document.getElementById('help-tab-dev');
  if (!helpModal) return;
  helpModal.classList.remove('hidden');
  helpModal.classList.add('flex');
  renderHelpContent(type);

  if (type === 'user') {
    helpTabUser.className =
      'rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white';
    helpTabDev.className =
      'rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600';
  } else {
    helpTabDev.className =
      'rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white';
    helpTabUser.className =
      'rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600';
  }
}

function closeHelp() {
  const helpModal = document.getElementById('help-modal');
  if (!helpModal) return;
  helpModal.classList.add('hidden');
  helpModal.classList.remove('flex');
}

export { renderHelpContent, openHelp, closeHelp };