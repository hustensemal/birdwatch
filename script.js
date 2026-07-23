const searchInput = document.getElementById('searchInput');
const buttons = [...document.querySelectorAll('.filter')];
const sections = [...document.querySelectorAll('.command-section')];
const cards = [...document.querySelectorAll('.command-card')];
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');

let activeFilter = 'all';

function normalize(value) {
  return value
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function setCollapsed(section, collapsed) {
  section.classList.toggle('collapsed', collapsed);
  const toggle = section.querySelector('.section-toggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Kategorie öffnen' : 'Kategorie schließen');
  }
}

function addSectionToggles() {
  sections.forEach((section, index) => {
    const heading = section.querySelector('.section-heading');
    const grid = section.querySelector('.command-grid');
    if (!heading || !grid) return;

    const gridId = `command-section-${index + 1}`;
    grid.id = gridId;

    const toggle = document.createElement('button');
    toggle.className = 'section-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', gridId);
    toggle.innerHTML = '<span aria-hidden="true">⌄</span>';

    toggle.addEventListener('click', () => {
      setCollapsed(section, !section.classList.contains('collapsed'));
    });

    heading.appendChild(toggle);
    setCollapsed(section, true);
  });
}

function showToast(message) {
  let toast = document.getElementById('copyToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copyToast';
    toast.className = 'copy-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 1700);
}

async function copyCommand(card) {
  const command = card.querySelector('code')?.textContent.trim();
  if (!command) return;

  try {
    await navigator.clipboard.writeText(command);
    showToast(`${command} wurde kopiert.`);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = command;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    showToast(`${command} wurde kopiert.`);
  }
}

function prepareCards() {
  cards.forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${card.querySelector('code')?.textContent.trim() || 'Command'} kopieren`);
    card.title = 'Command kopieren';

    if (!card.querySelector('.tag')) {
      const copyMark = document.createElement('span');
      copyMark.className = 'copy-mark';
      copyMark.setAttribute('aria-hidden', 'true');
      copyMark.textContent = '⧉';
      card.appendChild(copyMark);
    }

    card.addEventListener('click', () => copyCommand(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copyCommand(card);
      }
    });
  });
}

function updateList() {
  const query = normalize(searchInput.value.trim());
  let visibleCards = 0;

  sections.forEach((section) => {
    const categoryMatches = activeFilter === 'all' || section.dataset.category === activeFilter;
    let visibleInSection = 0;

    section.querySelectorAll('.command-card').forEach((card) => {
      const haystack = normalize(`${card.textContent} ${card.dataset.search || ''}`);
      const show = categoryMatches && (!query || haystack.includes(query));
      card.hidden = !show;
      if (show) {
        visibleInSection += 1;
        visibleCards += 1;
      }
    });

    section.hidden = visibleInSection === 0;

    if (query) {
      setCollapsed(section, false);
    } else if (activeFilter !== 'all' && categoryMatches) {
      setCollapsed(section, false);
    }
  });

  emptyState.hidden = visibleCards !== 0;
  resultCount.textContent = visibleCards === 1
    ? '1 Command wird angezeigt.'
    : `${visibleCards} Commands werden angezeigt.`;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    buttons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;

    if (activeFilter === 'all' && !searchInput.value.trim()) {
      sections.forEach((section) => setCollapsed(section, true));
    }

    updateList();
  });
});

searchInput.addEventListener('input', updateList);

addSectionToggles();
prepareCards();
updateList();

if (window.matchMedia('(min-width: 721px)').matches) {
  searchInput.focus({ preventScroll: true });
}
