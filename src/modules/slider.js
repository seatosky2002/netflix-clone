// 슬라이더 기능 모듈
export function initSliders() {
    // 무한 캐러셀은 main.js에서 처리하므로 제외
    const sliders = document.querySelectorAll('.content-list:not(.infinite-carousel)');
    
    sliders.forEach(slider => {
        const prevBtn = slider.parentElement.querySelector('.slider-prev');
        const nextBtn = slider.parentElement.querySelector('.slider-next');
        const items = slider.querySelectorAll('.content-item');
        
        if (!prevBtn || !nextBtn || items.length === 0) return;
        
        let currentIndex = 0;
        const itemsPerView = getItemsPerView();
        
        // 초기 상태 설정
        updateSlider();
        
        // 이전 버튼 이벤트
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex = Math.max(0, currentIndex - itemsPerView);
                updateSlider();
            }
        });
        
        // 다음 버튼 이벤트
        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - itemsPerView) {
                currentIndex = Math.min(items.length - itemsPerView, currentIndex + itemsPerView);
                updateSlider();
            }
        });
        
        function updateSlider() {
            const translateX = -(currentIndex * (100 / itemsPerView));
            slider.style.transform = `translateX(${translateX}%)`;
            
            // 버튼 상태 업데이트
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextBtn.style.opacity = currentIndex >= items.length - itemsPerView ? '0.5' : '1';
        }
        
        function getItemsPerView() {
            const width = window.innerWidth;
            if (width < 768) return 2;
            if (width < 1024) return 3;
            if (width < 1440) return 4;
            return 5;
        }
        
        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            const newItemsPerView = getItemsPerView();
            if (newItemsPerView !== itemsPerView) {
                currentIndex = Math.min(currentIndex, items.length - newItemsPerView);
                updateSlider();
            }
        });
    });
}
