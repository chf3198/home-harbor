/**
 * @fileoverview Help modal utilities with progressive disclosure
 * @description Renders help guides using native HTML details/summary elements
 * for accessible, collapsible sections per W3C ARIA accordion patterns.
 */

/**
 * Renders help content with collapsible sections
 * @param {string} type - 'user' or 'developer'
 */
function renderHelpContent(type) {
  const helpContent = document.getElementById('help-content');
  const guide = window.HOME_HARBOR_HELP?.[type];
  if (!guide || !helpContent) return;

  helpContent.innerHTML = `
    <h4 class="text-base font-semibold text-slate-900 mb-3">${guide.title}</h4>
    <div class="space-y-2">
      ${guide.sections
        .map(
          (section) => `
          <details class="group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <summary class="flex cursor-pointer items-center gap-2 p-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors list-none">
              <span class="text-base">${section.icon || '📄'}</span>
              <span class="flex-1">${section.heading}</span>
              <svg class="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="border-t border-slate-200 bg-white p-3">
              <p class="text-sm text-slate-600 mb-2">${section.summary || section.body || ''}</p>
              ${
                section.details
                  ? `<ul class="space-y-1.5 text-sm text-slate-600">
                      ${section.details.map((detail) => `<li class="flex gap-2"><span class="text-emerald-500">•</span><span>${detail}</span></li>`).join('')}
                    </ul>`
                  : ''
              }
            </div>
          </details>
        `
        )
        .join('')}
    </div>
  `;
}

/**
 * Opens the help modal with the specified guide type
 * @param {string} type - 'user' or 'developer'
 */
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

/**
 * Closes the help modal
 */
function closeHelp() {
  const helpModal = document.getElementById('help-modal');
  if (!helpModal) return;
  helpModal.classList.add('hidden');
  helpModal.classList.remove('flex');
}

export { renderHelpContent, openHelp, closeHelp };
