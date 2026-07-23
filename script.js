const searchInput = document.getElementById('searchInput');
const buttons = [...document.querySelectorAll('.filter')];
const sections = [...document.querySelectorAll('.command-section')];
const cards = [...document.querySelectorAll('.command-card')];
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');

let activeFilter = 'all';

function normalize(value) {
  return value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
  });

  emptyState.hidden = visibleCards !== 0;
  resultCount.textContent = visibleCards === 1 ? '1 Command wird angezeigt.' : `${visibleCards} Commands werden angezeigt.`;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    buttons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    updateList();
  });
});

searchInput.addEventListener('input', updateList);
updateList();
