// 검색 모듈
const SEARCH_API_URL = 'http://localhost:3000/api/search';
const RECENT_SEARCHES_KEY = 'netflix_recent_searches';
const MAX_RECENT_SEARCHES = 5;

// 검색 상태
let searchTimeout = null;
let isSearchOpen = false;
let selectedIndex = -1;
let recentSearches = [];

// localStorage에서 최근 검색어 불러오기
function loadRecentSearches() {
    try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        recentSearches = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('최근 검색어 불러오기 실패:', error);
        recentSearches = [];
    }
}

// localStorage에 최근 검색어 저장
function saveRecentSearches() {
    try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (error) {
        console.error('최근 검색어 저장 실패:', error);
    }
}

// 최근 검색어 추가 (중복 제거, 최신순, 최대 5개)
function addRecentSearch(query) {
    if (!query || query.trim().length === 0) return;

    // 중복 제거
    recentSearches = recentSearches.filter(item => item !== query);

    // 맨 앞에 추가
    recentSearches.unshift(query);

    // 최대 5개까지만 유지
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
        recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    saveRecentSearches();
}

// 최근 검색어 렌더링
function renderRecentSearches() {
    const recentSearchesContainer = document.querySelector('.recent-searches');
    const recentSearchesList = document.querySelector('.recent-searches-list');

    if (!recentSearchesList) return;

    if (recentSearches.length === 0) {
        recentSearchesList.innerHTML = '<div class="recent-searches-empty">최근 검색어가 없습니다</div>';
        return;
    }

    recentSearchesList.innerHTML = recentSearches.map((query, index) => `
        <li class="recent-search-item" data-index="${index}" data-query="${query}">
            <i class="fas fa-history"></i>
            <span>${query}</span>
        </li>
    `).join('');

    // 마우스 클릭 이벤트
    const items = recentSearchesList.querySelectorAll('.recent-search-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const query = item.getAttribute('data-query');
            selectRecentSearch(query);
        });
    });
}

// 최근 검색어 선택
function selectRecentSearch(query) {
    const searchInput = document.querySelector('.search-input');
    searchInput.value = query;
    hideRecentSearches();
    performSearch(query);
}

// 최근 검색어 레이어 표시
function showRecentSearches() {
    const recentSearchesContainer = document.querySelector('.recent-searches');
    if (recentSearches.length > 0) {
        recentSearchesContainer.style.display = 'block';
    }
}

// 최근 검색어 레이어 숨김
function hideRecentSearches() {
    const recentSearchesContainer = document.querySelector('.recent-searches');
    recentSearchesContainer.style.display = 'none';
    selectedIndex = -1;
    updateSelectedItem();
}

// 키보드 네비게이션 - 선택된 아이템 업데이트
function updateSelectedItem() {
    const items = document.querySelectorAll('.recent-search-item');
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// 키보드 네비게이션 - 위 방향키
function navigateUp() {
    if (selectedIndex > 0) {
        selectedIndex--;
        updateSelectedItem();
    }
}

// 키보드 네비게이션 - 아래 방향키
function navigateDown() {
    if (selectedIndex < recentSearches.length - 1) {
        selectedIndex++;
        updateSelectedItem();
    }
}

// 키보드 네비게이션 - Enter 키
function selectCurrentItem() {
    if (selectedIndex >= 0 && selectedIndex < recentSearches.length) {
        const query = recentSearches[selectedIndex];
        selectRecentSearch(query);
    }
}

export function initSearch() {
    // 최근 검색어 불러오기
    loadRecentSearches();

    const searchIcon = document.querySelector('.search-icon');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const searchClose = document.querySelector('.search-close');
    const searchResultsContainer = document.getElementById('search-results');
    const mainContent = document.querySelector('.main-content');

    if (!searchIcon || !searchContainer || !searchInput || !searchClose) {
        console.error('검색 요소를 찾을 수 없습니다.');
        return;
    }

    // 검색 아이콘 클릭 - 검색창 열기
    searchIcon.addEventListener('click', () => {
        toggleSearch(true);
    });

    // 닫기 버튼 클릭
    searchClose.addEventListener('click', () => {
        toggleSearch(false);
        clearSearchResults();
    });

    // 검색 입력창 포커스 - 최근 검색어 표시
    searchInput.addEventListener('focus', () => {
        renderRecentSearches();
        if (searchInput.value.trim().length === 0) {
            showRecentSearches();
        }
    });

    // 검색 입력창 블러 - 최근 검색어 숨김 (약간의 지연)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            hideRecentSearches();
        }, 200);
    });

    // 검색 입력 이벤트
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // 입력값이 있으면 최근 검색어 숨김
        if (query.length > 0) {
            hideRecentSearches();
        } else {
            showRecentSearches();
        }

        // 디바운싱: 입력이 멈춘 후 500ms 후에 검색
        clearTimeout(searchTimeout);

        if (query.length === 0) {
            clearSearchResults();
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
            addRecentSearch(query);
            renderRecentSearches();
        }, 500);
    });

    // 키보드 네비게이션
    searchInput.addEventListener('keydown', (e) => {
        const recentSearchesContainer = document.querySelector('.recent-searches');
        const isRecentSearchesVisible = recentSearchesContainer.style.display === 'block';

        if (isRecentSearchesVisible) {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    navigateDown();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    navigateUp();
                    break;
                case 'Enter':
                    if (selectedIndex >= 0) {
                        e.preventDefault();
                        selectCurrentItem();
                    }
                    break;
                case 'Escape':
                    hideRecentSearches();
                    break;
            }
        }
    });

    // ESC 키로 검색창 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSearchOpen) {
            toggleSearch(false);
            clearSearchResults();
        }
    });

    function toggleSearch(open) {
        isSearchOpen = open;
        if (open) {
            searchContainer.classList.add('active');
            searchInput.focus();
        } else {
            searchContainer.classList.remove('active');
            searchInput.value = '';
            hideRecentSearches();
        }
    }

    function clearSearchResults() {
        searchResultsContainer.style.display = 'none';
        mainContent.style.display = 'block';
    }
}

async function performSearch(query) {
    try {
        const response = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            displaySearchResults(data.results, query);
        }
    } catch (error) {
        console.error('검색 중 오류 발생:', error);
        displaySearchError();
    }
}

function displaySearchResults(results, query) {
    const searchResultsContainer = document.getElementById('search-results');
    const mainContent = document.querySelector('.main-content');
    const searchResultsContent = document.querySelector('.search-results-content');

    // Top 10 시리즈 제외 필터링
    const filteredResults = results.filter(item => {
        return item.id >= 11; // Top 10 시리즈는 id 1-10
    });

    // 메인 콘텐츠 숨기고 검색 결과 표시
    mainContent.style.display = 'none';
    searchResultsContainer.style.display = 'block';

    if (filteredResults.length === 0) {
        searchResultsContent.innerHTML = `
            <div class="search-no-results">
                <h2>"${query}"에 대한 검색 결과가 없습니다.</h2>
                <p>다른 검색어를 입력해 보세요.</p>
            </div>
        `;
        return;
    }

    // 섹션별로 그룹화
    const curatedContent = filteredResults.filter(item => item.id >= 11 && item.id <= 25);
    const koreanContent = filteredResults.filter(item => item.id >= 26);

    let sectionsHTML = '';

    // 회원님을 위해 엄선한 오늘의 콘텐츠 섹션
    if (curatedContent.length > 0) {
        sectionsHTML += createSearchSection('회원님을 위해 엄선한 오늘의 콘텐츠', curatedContent);
    }

    // 한국이 만든 콘텐츠 섹션
    if (koreanContent.length > 0) {
        sectionsHTML += createSearchSection('한국이 만든 콘텐츠', koreanContent);
    }

    searchResultsContent.innerHTML = `
        <div class="search-results-header">
            <h2>"${query}" 검색 결과 (${filteredResults.length}개)</h2>
        </div>
        ${sectionsHTML}
    `;
}

function createSearchSection(title, items) {
    const itemsHTML = items.map(item => `
        <div class="search-result-item hover-scale">
            <img src="${item.image}" alt="${item.title}" class="search-result-image">
            <div class="search-result-title">${item.title}</div>
        </div>
    `).join('');

    return `
        <div class="search-section">
            <h3 class="search-section-title">${title}</h3>
            <div class="search-results-grid">
                ${itemsHTML}
            </div>
        </div>
    `;
}

function displaySearchError() {
    const searchResultsContent = document.querySelector('.search-results-content');
    const searchResultsContainer = document.getElementById('search-results');
    const mainContent = document.querySelector('.main-content');

    mainContent.style.display = 'none';
    searchResultsContainer.style.display = 'block';

    searchResultsContent.innerHTML = `
        <div class="search-error">
            <h2>검색 중 오류가 발생했습니다.</h2>
            <p>잠시 후 다시 시도해 주세요.</p>
        </div>
    `;
}
