// CSS 파일 import (index.html에서 직접 로드하므로 생략 가능)

// 모듈 import
import { initSliders } from './modules/slider.js';
import { initModals } from './modules/modal.js';
import { initNavigation } from './modules/navigation.js';
import { fetchContentData, renderContentSections } from './modules/data.js';

// 이미지 로딩 대기
function waitForImages(el) {
  const imgs = Array.from(el.querySelectorAll('img'));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map(img => (img.complete ? Promise.resolve()
      : new Promise(res => img.addEventListener('load', res, { once: true }))))
  );
}

// 아이템 한 칸 실제 폭 계산
function measureStepWidth(listEl) {
  const items = listEl.querySelectorAll('.content-item');
  if (items.length < 2) {
    const it = items[0];
    if (!it) return 0;
    const r = it.getBoundingClientRect();
    const cs = getComputedStyle(it);
    return Math.round(r.width + parseFloat(cs.marginLeft || 0) + parseFloat(cs.marginRight || 0));
  }
  const r1 = items[0].getBoundingClientRect();
  const r2 = items[1].getBoundingClientRect();
  return Math.round(r2.left - r1.left);
}

function setupInfiniteCarousel(listEl, itemsPerStep = 5) {
  const originalItems = Array.from(listEl.children).filter(c => c.classList?.contains('content-item'));
  if (originalItems.length === 0) return null;

  // 앞뒤 복제
  const pre = document.createDocumentFragment();
  const post = document.createDocumentFragment();
  originalItems.slice().reverse().forEach(n => {
    const clone = n.cloneNode(true);
    clone.setAttribute('data-clone', 'true');
    pre.appendChild(clone);
  });
  originalItems.forEach(n => {
    const clone = n.cloneNode(true);
    clone.setAttribute('data-clone', 'true');
    post.appendChild(clone);
  });
  listEl.insertBefore(pre, listEl.firstChild);
  listEl.appendChild(post);

  let stepWidth = 0;
  let originalWidth = 0;
  let paddingLeft = 0;
  let isAnimating = false;

  // 모듈러 기반 보정
  function normalizeToBand() {
    const prev = listEl.style.scrollBehavior;
    const x = listEl.scrollLeft - originalWidth;
    const within = ((x % originalWidth) + originalWidth) % originalWidth;
    const target = originalWidth + within;

    if (Math.abs(target - listEl.scrollLeft) > 1) {
      listEl.style.scrollBehavior = 'auto';
      listEl.scrollLeft = target;
      listEl.style.scrollBehavior = prev || 'smooth';
    }
  }

  function initPositions() {
    const cs = getComputedStyle(listEl);
    paddingLeft = parseFloat(cs.paddingLeft || 0);
    stepWidth = measureStepWidth(listEl);
    originalWidth = stepWidth * originalItems.length;

    // 원본 시작점 세팅
    const prev = listEl.style.scrollBehavior;
    listEl.style.scrollBehavior = 'auto';
    listEl.scrollLeft = Math.round(originalWidth);
    listEl.style.scrollBehavior = prev || 'smooth';

    // 스크롤 이벤트
    let ticking = false;
    listEl.addEventListener('scroll', () => {
      if (isAnimating) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        normalizeToBand();
        ticking = false;
      });
    });

    // 버튼 이동
    function move(direction) {
      if (isAnimating || !stepWidth) return;
      const delta = (direction === 'next' ? 1 : -1) * (itemsPerStep * stepWidth);
      isAnimating = true;
      listEl.scrollBy({ left: delta, behavior: 'smooth' });

      const onEnd = () => {
        isAnimating = false;
        normalizeToBand();
      };

      if ('onscrollend' in window) {
        const handler = () => { listEl.removeEventListener('scrollend', handler); onEnd(); };
        listEl.addEventListener('scrollend', handler, { once: true });
      } else {
        setTimeout(onEnd, 350);
      }
    }

    // 리사이즈 대응
    let resizeRAF;
    const onResize = () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(() => {
        const prevX = listEl.scrollLeft - originalWidth;
        const ratio = prevX / (originalWidth || 1);

        const cs2 = getComputedStyle(listEl);
        paddingLeft = parseFloat(cs2.paddingLeft || 0);
        stepWidth = measureStepWidth(listEl);
        originalWidth = stepWidth * originalItems.length;

        const target = Math.round(originalWidth + ratio * originalWidth);
        const prev = listEl.style.scrollBehavior;
        listEl.style.scrollBehavior = 'auto';
        listEl.scrollLeft = target;
        listEl.style.scrollBehavior = prev || 'smooth';
        normalizeToBand();
      });
    };
    window.addEventListener('resize', onResize);

    return { move };
  }

  return waitForImages(listEl).then(initPositions);
}

// Top10 (유한 캐러셀)
function scrollContent(button, direction) {
    const section = button.closest('.content-section');
  if (section.querySelector('.top10-row')) {
    const contentList = section.querySelector('.content-list');
    const amount = Math.round(contentList.clientWidth * 0.8);
    contentList.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  }
}

 // 페이지네이션 업데이트 함수
 function updatePagination(section, currentPage, totalPages) {
   const paginationIndicator = section.querySelector('.pagination-indicator');
   if (!paginationIndicator) return;
   
   const dots = paginationIndicator.querySelectorAll('.pagination-dot');
   dots.forEach((dot, index) => {
     dot.classList.toggle('active', index === currentPage);
   });
 }
 
 // 페이지네이션 계산 및 생성 함수
 function calculateAndCreatePagination(section, list, itemsPerStep, itemsPerPage) {
   // 원본 아이템 수만 계산 (복제 제외) - 무한 캐러셀의 실제 콘텐츠
   const originalItems = list.querySelectorAll('.content-item:not([data-clone])').length;
   
   // 원본 아이템 기준으로 페이지 수 계산
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

// 캐러셀 초기화 함수
function initializeCarousels() {
    document.querySelectorAll('.content-section').forEach(section => {
        const list = section.querySelector('.content-list.infinite-carousel');
        if (!list) return;

        // Top 10 섹션은 4개씩, 다른 섹션은 5개씩 이동
        const itemsPerStep = section.querySelector('.top10-row') ? 4 : 5;
        const itemsPerPage = itemsPerStep; // 한 페이지에 표시되는 아이템 수

        list.style.scrollBehavior = 'smooth';
        setupInfiniteCarousel(list, itemsPerStep)?.then(controller => {
          if (!controller) return;

          // 페이지네이션 초기화
          const totalPages = calculateAndCreatePagination(section, list, itemsPerStep, itemsPerPage);

          // 슬라이더 버튼 이벤트 리스너
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
        });
    });
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Netflix Clone 앱이 시작됩니다.');

    // 각 모듈 초기화
    initSliders();
    initModals();
    initNavigation();

    // 콘텐츠 데이터 컨테이너가 있을 때만 동적 렌더링 수행
    if (document.getElementById('dynamic-content-sections')) {
        console.log('서버에서 콘텐츠 데이터를 가져오는 중...');
        const contentData = await fetchContentData();
        if (contentData) {
            console.log('콘텐츠 렌더링 중...');
            renderContentSections(contentData);
            // 동적 콘텐츠 렌더링 후 캐러셀 초기화
            console.log('캐러셀 초기화 중...');
            initializeCarousels();
        } else {
            console.error('서버에서 콘텐츠를 가져올 수 없습니다. 서버가 실행 중인지 확인하세요.');
        }
    }
});