
import { initializeHeaderModals, initializeHeaderScroll } from './header.js';
import { CardSlider, initializeAllCardSliders, createCardSlider } from './CardSlider.js';

function initializeApp() {
  console.log('🎬 Netflix Clone App Initializing...');
  
  // 헤더 모달 초기화
  initializeHeaderModals();
  initializeHeaderScroll();
  
  // 모든 카드 슬라이더 초기화 (자동 감지 및 설정)
  const cardSliders = initializeAllCardSliders({
    autoDetectItemsPerStep: true,
    infinite: true,
    pagination: true,
    
    // 콜백 함수들
    onInit: (slider) => {
      console.log(`✅ CardSlider 초기화 완료`);
    },
    onSlide: (direction, currentPage, slider) => {
      console.log(`🔄 슬라이드: ${direction}, 현재 페이지: ${currentPage + 1}/${slider.getTotalPages()}`);
    },
    onError: (error) => {
      console.error('❌ CardSlider 오류:', error);
    }
  });
  
  console.log(`🚀 Netflix Clone App 초기화 완료! (${cardSliders.length}개 슬라이더 생성)`);
}

document.addEventListener('DOMContentLoaded', initializeApp);


if (import.meta.env?.MODE === 'development') {
  window.NetflixClone = {
    CardSlider,
    createCardSlider,
    initializeAllCardSliders,
    initializeHeaderModals,
    initializeHeaderScroll,
    initializeApp
  };
  console.log('🔧 Development mode: NetflixClone object available in window');
}
