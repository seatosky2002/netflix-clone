
export function updatePagination(section, currentPage, totalPages) {
  const paginationIndicator = section.querySelector('.pagination-indicator');
  if (!paginationIndicator) return;
  
  const dots = paginationIndicator.querySelectorAll('.pagination-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage);
  });
}

export function calculateAndCreatePagination(section, list, itemsPerStep, itemsPerPage) {
  const originalItems = list.querySelectorAll('.content-item:not([data-clone])').length;
  
  const totalPages = Math.ceil(originalItems / itemsPerPage);
  
  // 페이지네이션 도트 동적 생성
  const paginationIndicator = section.querySelector('.pagination-indicator');
  if (paginationIndicator) {
    paginationIndicator.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = `pagination-dot ${i === 0 ? 'active' : ''}`;
      paginationIndicator.appendChild(dot);
    }
  }
  
  return totalPages;
}

export function setupPaginationForSection(section, controller, itemsPerStep, itemsPerPage) {
  const list = section.querySelector('.content-list.infinite-carousel');
  if (!list) return;
  
  const totalPages = calculateAndCreatePagination(section, list, itemsPerStep, itemsPerPage);
  
  let currentPage = 0;
  section.querySelector('.slider-prev')?.addEventListener('click', () => {
    currentPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
    updatePagination(section, currentPage, totalPages);
    controller.move('prev');
  });
  
  section.querySelector('.slider-next')?.addEventListener('click', () => {
    currentPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
    updatePagination(section, currentPage, totalPages);
    controller.move('next');
  });
}
