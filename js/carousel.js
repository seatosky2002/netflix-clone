
function waitForImages(listEl) {
  return new Promise(resolve => {
    const imgs = listEl.querySelectorAll('img');
    if (imgs.length === 0) {
      resolve();
      return;
    }
    
    let loaded = 0;
    const total = imgs.length;
    
    const checkComplete = () => {
      loaded++;
      if (loaded === total) resolve();
    };
    
    imgs.forEach(img => {
      if (img.complete) {
        checkComplete();
      } else {
        img.addEventListener('load', checkComplete);
        img.addEventListener('error', checkComplete);
      }
    });
  });
}

function measureStepWidth(listEl) {
  const firstItem = listEl.querySelector('.content-item');
  if (!firstItem) return 0;
  
  const style = getComputedStyle(firstItem);
  return firstItem.offsetWidth + parseFloat(style.marginRight || 0);
}

export function setupInfiniteCarousel(listEl, itemsPerStep = 5) {
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

      if ('onscrollend' in listEl) {
        listEl.addEventListener('scrollend', onEnd, { once: true });
      } else {
        setTimeout(onEnd, 400);
      }
    }

    // 리사이즈 이벤트
    function onResize() {
      stepWidth = measureStepWidth(listEl);
      originalWidth = stepWidth * originalItems.length;
      normalizeToBand();
    }

    window.addEventListener('resize', onResize);

    return { move };
  }

  return waitForImages(listEl).then(initPositions);
}

export function scrollContent(button, direction) {
  const section = button.closest('.content-section');
  if (section.querySelector('.top10-row')) {
    const contentList = section.querySelector('.content-list');
    const amount = Math.round(contentList.clientWidth * 0.8);
    contentList.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  }
}
