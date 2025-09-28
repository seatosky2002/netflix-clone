// 메인 앱 초기화
import { initSliders } from './modules/slider.js';
import { initModals } from './modules/modal.js';
import { initNavigation } from './modules/navigation.js';

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('Netflix Clone 앱이 시작됩니다.');
    
    // 각 모듈 초기화
    initSliders();
    initModals();
    initNavigation();
});
