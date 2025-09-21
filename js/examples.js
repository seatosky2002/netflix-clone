

import { CardSlider, createCardSlider, initializeAllCardSliders } from './CardSlider.js';

// 예시 1: 기본 설정으로 모든 섹션 초기화
export function example1_BasicUsage() {
  return initializeAllCardSliders({
    autoDetectItemsPerStep: true, // Top 10은 4개, 나머지는 5개
    infinite: true,
    pagination: true
  });
}

// 예시 2: 커스텀 설정으로 개별 섹션 초기화
export function example2_CustomSettings() {
  const sections = document.querySelectorAll('.content-section');
  const sliders = [];
  
  sections.forEach((section, index) => {
    const slider = new CardSlider(section, {
      itemsPerStep: index === 0 ? 3 : 6, // 첫 번째는 3개, 나머지는 6개
      itemsPerPage: index === 0 ? 3 : 6,
      infinite: true,
      pagination: true,
      transitionDuration: 500, // 더 느린 애니메이션
      
      onSlide: (direction, currentPage, slider) => {
        console.log(`섹션 ${index + 1}: ${direction} 방향으로 슬라이드, 페이지 ${currentPage + 1}`);
      }
    });
    
    sliders.push(slider);
  });
  
  return sliders;
}

// 예시 3: 무한 캐러셀 없는 일반 슬라이더
export function example3_FiniteSlider() {
  const section = document.querySelector('.content-section:first-child');
  
  return new CardSlider(section, {
    itemsPerStep: 2,
    itemsPerPage: 2,
    infinite: false, // 무한 캐러셀 비활성화
    pagination: true,
    scrollBehavior: 'auto'
  });
}

// 예시 4: 페이지네이션 없는 슬라이더
export function example4_NoPagination() {
  const section = document.querySelector('.content-section:last-child');
  
  return new CardSlider(section, {
    itemsPerStep: 4,
    itemsPerPage: 4,
    infinite: true,
    pagination: false, // 페이지네이션 비활성화
  });
}

// 예시 5: 완전 커스텀 설정
export function example5_FullyCustom() {
  const section = document.querySelector('.content-section');
  
  return new CardSlider(section, {
    // 슬라이더 설정
    itemsPerStep: 3,
    itemsPerPage: 3,
    infinite: true,
    pagination: true,
    
    // 셀렉터 커스터마이징
    carouselSelector: '.custom-carousel',
    paginationSelector: '.custom-pagination',
    prevButtonSelector: '.custom-prev',
    nextButtonSelector: '.custom-next',
    titleSelector: '.custom-title',
    
    // 애니메이션 설정
    scrollBehavior: 'smooth',
    transitionDuration: 400,
    
    // 콜백 함수들
    onInit: (slider) => {
      console.log('🎬 커스텀 슬라이더 초기화 완료!');
      
      // 추가 이벤트 리스너 등록
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') slider.slide('prev');
        if (e.key === 'ArrowRight') slider.slide('next');
      });
    },
    
    onSlide: (direction, currentPage, slider) => {
      console.log(`🎯 슬라이드: ${direction}, 페이지: ${currentPage + 1}/${slider.getTotalPages()}`);
      
      // 특정 페이지에서 추가 동작
      if (currentPage === 0) {
        console.log('🏠 첫 번째 페이지입니다!');
      }
    },
    
    onError: (error) => {
      console.error('💥 슬라이더 오류:', error);
    }
  });
}

// 예시 6: 프로그래밍 방식으로 슬라이더 제어
export function example6_ProgrammaticControl() {
  const sliders = initializeAllCardSliders();
  
  // 5초마다 자동으로 다음 페이지로 이동
  setInterval(() => {
    sliders.forEach(slider => {
      if (slider && slider.isInitialized) {
        slider.slide('next');
      }
    });
  }, 5000);
  
  // 특정 페이지로 직접 이동하는 함수
  window.goToPage = (sliderIndex, pageIndex) => {
    if (sliders[sliderIndex]) {
      sliders[sliderIndex].goToPage(pageIndex);
    }
  };
  
  // 슬라이더 상태 확인 함수
  window.getSliderInfo = (sliderIndex) => {
    const slider = sliders[sliderIndex];
    if (!slider) return null;
    
    return {
      currentPage: slider.getCurrentPage(),
      totalPages: slider.getTotalPages(),
      isInitialized: slider.isInitialized
    };
  };
  
  return sliders;
}

// 예시 7: 동적 슬라이더 생성
export function example7_DynamicSlider() {
  // 새로운 섹션 HTML 생성
  const newSection = document.createElement('section');
  newSection.className = 'content-section';
  newSection.innerHTML = `
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">동적으로 생성된 섹션</h2>
        <div class="pagination-indicator"></div>
      </div>
      <div class="content-wrapper">
        <button class="slider-nav slider-prev">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="slider-nav slider-next">
          <i class="fas fa-chevron-right"></i>
        </button>
        <div class="content-list infinite-carousel">
          ${Array.from({length: 10}, (_, i) => `
            <div class="content-item">
              <img src="images/placeholder-${i + 1}.jpg" alt="동적 콘텐츠 ${i + 1}" class="content-image">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  // DOM에 추가
  document.body.appendChild(newSection);
  
  // 슬라이더 초기화
  return new CardSlider(newSection, {
    itemsPerStep: 4,
    itemsPerPage: 4,
    infinite: true,
    pagination: true,
    onInit: () => console.log('🆕 동적 슬라이더 생성 완료!')
  });
}

// 모든 예시 실행 함수
export function runAllExamples() {
  console.log('🚀 CardSlider 예시들을 실행합니다...');
  
  // 예시 1: 기본 사용법
  const basicSliders = example1_BasicUsage();
  console.log(`예시 1 완료: ${basicSliders.length}개 슬라이더 생성`);
  
  // 예시 6: 프로그래밍 제어
  example6_ProgrammaticControl();
  console.log('예시 6 완료: 자동 슬라이드 및 제어 함수 등록');
  
  // 개발 모드에서 전역 함수로 노출
  if (typeof window !== 'undefined') {
    window.CardSliderExamples = {
      example1_BasicUsage,
      example2_CustomSettings,
      example3_FiniteSlider,
      example4_NoPagination,
      example5_FullyCustom,
      example6_ProgrammaticControl,
      example7_DynamicSlider,
      runAllExamples
    };
    
    console.log('🔧 개발 모드: CardSliderExamples 객체가 window에 등록되었습니다.');
    console.log('사용법: window.CardSliderExamples.example5_FullyCustom()');
  }
}
