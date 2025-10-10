// 검색 모듈
const SEARCH_API_URL = 'http://localhost:3000/api/search';

// 검색 상태
let searchTimeout = null;
let isSearchOpen = false;

export function initSearch() {
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

    // 검색 입력 이벤트
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // 디바운싱: 입력이 멈춘 후 500ms 후에 검색
        clearTimeout(searchTimeout);

        if (query.length === 0) {
            clearSearchResults();
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500);
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
