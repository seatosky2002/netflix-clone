

import { setupInfiniteCarousel } from './carousel.js';
import { updatePagination, calculateAndCreatePagination } from './pagination.js';

export class CardSlider {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      // 기본 설정
      itemsPerStep: 5,
      itemsPerPage: 5,
      infinite: true,
      pagination: true,
      autoDetectItemsPerStep: false,
      carouselSelector: '.content-list.infinite-carousel',
      paginationSelector: '.pagination-indicator',
      prevButtonSelector: '.slider-prev',
      nextButtonSelector: '.slider-next',
      titleSelector: '.section-title',
      
      // 애니메이션 설정
      scrollBehavior: 'smooth',
      transitionDuration: 300,
      
      // 이벤트 콜백
      onInit: null,
      onSlide: null,
      onError: null,
      
      // 사용자 정의 설정으로 덮어쓰기
      ...options
    };
    
    this.list = null;
    this.controller = null;
    this.currentPage = 0;
    this.totalPages = 0;
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    try {
      // 컨테이너 요소 검증
      if (!this.container || !this.container.querySelector) {
        throw new Error('유효하지 않은 컨테이너 요소입니다.');
      }
      
      // 캐러셀 리스트 찾기
      this.list = this.container.querySelector(this.options.carouselSelector);
      if (!this.list) {
        console.warn(`캐러셀 리스트를 찾을 수 없습니다: ${this.options.carouselSelector}`);
        return;
      }
      
      // 아이템 수 자동 감지
      if (this.options.autoDetectItemsPerStep) {
        this.autoDetectItemsPerStep();
      }
      
      // 스크롤 동작 설정
      this.list.style.scrollBehavior = this.options.scrollBehavior;
      
      // 무한 캐러셀 설정
      if (this.options.infinite) {
        this.controller = await setupInfiniteCarousel(this.list, this.options.itemsPerStep);
        if (!this.controller) {
          throw new Error('무한 캐러셀 초기화에 실패했습니다.');
        }
      }
      
      // 페이지네이션 설정
      if (this.options.pagination) {
        this.setupPagination();
      }
      
      // 이벤트 리스너 설정
      this.setupEventListeners();
      
      this.isInitialized = true;
      
      if (this.options.onInit) {
        this.options.onInit(this);
      }
      
      const title = this.container.querySelector(this.options.titleSelector)?.textContent || 'Unknown';
      console.log(`✅ CardSlider initialized: ${title}`);
      
    } catch (error) {
      console.error('❌ CardSlider 초기화 실패:', error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }
  
  autoDetectItemsPerStep() {
    // Top 10 섹션 감지 (top10-row 클래스 존재)
    if (this.container.querySelector('.top10-row')) {
      this.options.itemsPerStep = 4;
      this.options.itemsPerPage = 4;
    }
    // 다른 섹션은 기본값 5 유지
  }
  
  setupPagination() {
    // 페이지네이션 도트 생성
    this.totalPages = calculateAndCreatePagination(
      this.container, 
      this.list, 
      this.options.itemsPerStep, 
      this.options.itemsPerPage
    );
    
    // 첫 번째 페이지 활성화
    this.updatePagination(0);
  }
  
  setupEventListeners() {
    // 이전 버튼
    const prevButton = this.container.querySelector(this.options.prevButtonSelector);
    if (prevButton) {
      prevButton.addEventListener('click', () => this.slide('prev'));
    }
    
    // 다음 버튼
    const nextButton = this.container.querySelector(this.options.nextButtonSelector);
    if (nextButton) {
      nextButton.addEventListener('click', () => this.slide('next'));
    }
  }
  
  slide(direction) {
    if (!this.isInitialized) return;
    
    // 페이지네이션 업데이트
    if (this.options.pagination) {
      this.currentPage = direction === 'next' 
        ? (this.currentPage < this.totalPages - 1 ? this.currentPage + 1 : 0)
        : (this.currentPage > 0 ? this.currentPage - 1 : this.totalPages - 1);
      
      this.updatePagination(this.currentPage);
    }
    
    // 캐러셀 이동
    if (this.controller) {
      this.controller.move(direction);
    }
    
    // 슬라이드 콜백
    if (this.options.onSlide) {
      this.options.onSlide(direction, this.currentPage, this);
    }
  }
  
  updatePagination(pageIndex) {
    if (!this.options.pagination) return;
    updatePagination(this.container, pageIndex, this.totalPages);
  }
  
  // 공개 메서드들
  getCurrentPage() {
    return this.currentPage;
  }
  
  getTotalPages() {
    return this.totalPages;
  }
  
  goToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;
    
    const direction = pageIndex > this.currentPage ? 'next' : 'prev';
    const steps = Math.abs(pageIndex - this.currentPage);
    
    for (let i = 0; i < steps; i++) {
      setTimeout(() => this.slide(direction), i * this.options.transitionDuration);
    }
  }
  
  destroy() {
    // 이벤트 리스너 제거
    const prevButton = this.container.querySelector(this.options.prevButtonSelector);
    const nextButton = this.container.querySelector(this.options.nextButtonSelector);
    
    if (prevButton) {
      prevButton.replaceWith(prevButton.cloneNode(true));
    }
    if (nextButton) {
      nextButton.replaceWith(nextButton.cloneNode(true));
    }
    
    this.isInitialized = false;
    this.controller = null;
  }
}

export function createCardSlider(container, options = {}) {
  return new CardSlider(container, options);
}

export function initializeAllCardSliders(options = {}) {
  const sections = document.querySelectorAll('.content-section');
  const sliders = [];
  
  sections.forEach(section => {
    const slider = new CardSlider(section, options);
    sliders.push(slider);
  });
  
  return sliders;
}
