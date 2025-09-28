// 메인 앱 초기화
import { initSliders } from './modules/slider.js';
import { initModals } from './modules/modal.js';
import { initNavigation } from './modules/navigation.js';
import { fetchContentData, renderContentSections } from './modules/data.js';

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Netflix Clone 앱이 시작됩니다.');
    
    // 콘텐츠 데이터 로드 및 렌더링
    const contentData = await fetchContentData();
    if (contentData) {
        renderContentSections(contentData);
    }
    
    // 각 모듈 초기화
    initSliders();
    initModals();
    initNavigation();
});
