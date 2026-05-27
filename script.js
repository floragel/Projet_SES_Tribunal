// Global Modal Logic
window.openModal = function(role, name, powers, objectifs, argumentsText, position) {
    document.getElementById('m-tag').innerText = role;
    document.getElementById('m-name').innerText = name;
    document.getElementById('m-powers').innerText = powers;
    document.getElementById('m-objectifs').innerText = objectifs;
    document.getElementById('m-arguments').innerText = argumentsText;
    document.getElementById('m-position-text').innerText = position;
    
    // Style the position badge dynamically
    const badge = document.getElementById('m-position-badge');
    badge.innerText = position;
    if (position.includes('Défense')) {
        badge.style.backgroundColor = 'var(--blue-france)';
        badge.style.color = '#FFFFFF';
    } else if (position.includes('Accusation')) {
        badge.style.backgroundColor = 'var(--red-marianne)';
        badge.style.color = '#FFFFFF';
    } else {
        badge.style.backgroundColor = '#666666';
        badge.style.color = '#FFFFFF';
    }
    
    document.getElementById('modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.openArticleModal = function(media, title, content) {
    document.getElementById('a-media').innerText = media;
    document.getElementById('a-title').innerText = title;
    document.getElementById('a-lead').innerText = content.substring(0, Math.min(content.length, 100)) + '...';
    document.getElementById('a-content').innerText = content;
    document.getElementById('article-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeArticleModal = function() {
    document.getElementById('article-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.closeArticleModalOnOverlay = function(e) {
    if (e.target.id === 'article-modal') window.closeArticleModal();
};

window.closeModal = function() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.closeModalOnOverlay = function(e) {
    if (e.target.id === 'modal') window.closeModal();
};

// Tab Switch Logic
window.switchTab = function(event, tabId) {
    // Hide all tab content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // Deactivate all tab buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content and active button
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeModal();
        if (window.closeArticleModal) window.closeArticleModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Init Lucide Icons
    try {
        lucide.createIcons();
    } catch(e) {}

    // Theme Switching
    const themeBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    
    // Check local storage for theme safely
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('theme') || 'light';
    } catch(e) {}
    
    root.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', newTheme);
        try {
            localStorage.setItem('theme', newTheme);
        } catch(e) {}
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = theme === 'light' ? 'moon' : 'sun';
        const text = theme === 'light' ? 'Mode Sombre' : 'Mode Clair';
        // Completely recreate innerHTML to prevent querySelector('i') crash after lucide replaces the element
        themeBtn.innerHTML = `<i data-lucide="${icon}" size="16"></i> <span>${text}</span>`;
        try { lucide.createIcons(); } catch(e) {}
    }

    // Search Logic with Highlighting (Mark.js and Filtering)
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const cards = document.querySelectorAll('.card, .press-card');
    const categories = document.querySelectorAll('.tab-content, .press-column');
    
    // Initialize mark.js on the main content area
    const markInstance = new Mark(document.querySelector('main'));

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        // 1. Filter the cards
        cards.forEach(card => {
            const nameEl = card.querySelector('.card-name');
            const tagEl = card.querySelector('.card-tag');
            
            if(!nameEl || !tagEl) return;
            
            const name = nameEl.innerText.toLowerCase();
            const tag = tagEl.innerText.toLowerCase();
            
            if (query === '' || name.includes(query) || tag.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // 2. Hide empty categories/tabs or filter tab buttons
        categories.forEach(cat => {
            const visibleCards = cat.querySelectorAll('.card:not(.hidden), .press-card:not(.hidden)');
            const tabId = cat.id;
            
            if (tabId && tabId.startsWith('tab-')) {
                const tabBtn = document.querySelector(`[onclick*="${tabId}"]`);
                if (tabBtn) {
                    if (visibleCards.length === 0 && query !== '') {
                        tabBtn.style.display = 'none';
                    } else {
                        tabBtn.style.display = 'inline-block';
                    }
                }
            } else {
                if (visibleCards.length === 0 && query !== '') {
                    cat.classList.add('hidden');
                } else {
                    cat.classList.remove('hidden');
                }
            }
        });

        // 3. Highlight text globally in the main area (Ctrl+F effect)
        markInstance.unmark({
            done: () => {
                if (query !== '') {
                    markInstance.mark(query, {
                        className: 'search-highlight'
                    });
                }
            }
        });
    }

    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', performSearch);
        searchBtn.addEventListener('click', performSearch);
    }

    // President Video Control
    const videoContainer = document.getElementById('president-video-container');
    const video = document.getElementById('president-video');
    const playPauseBtn = document.getElementById('ctrl-play-pause');
    const muteBtn = document.getElementById('ctrl-mute');
    const fullscreenBtn = document.getElementById('ctrl-fullscreen');
    const viewersEl = document.getElementById('viewers-number');
    
    if (videoContainer && video) {
        // Toggle play/pause
        const togglePlay = () => {
            if (video.paused) {
                video.play();
                videoContainer.classList.add('playing');
                if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="pause" size="20"></i>';
            } else {
                video.pause();
                videoContainer.classList.remove('playing');
                if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="play" size="20"></i>';
            }
            try { lucide.createIcons(); } catch(e) {}
        };

        // Main container click (excluding controls)
        videoContainer.addEventListener('click', (e) => {
            if (e.target.closest('.custom-controls')) return;
            togglePlay();
        });

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });
        }

        // Mute/Unmute
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                if (video.muted) {
                    muteBtn.innerHTML = '<i data-lucide="volume-x" size="20"></i>';
                } else {
                    muteBtn.innerHTML = '<i data-lucide="volume-2" size="20"></i>';
                }
                try { lucide.createIcons(); } catch(e) {}
            });
        }

        // Fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) { /* Safari */
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) { /* IE11 */
                    video.msRequestFullscreen();
                }
            });
        }
        
        video.addEventListener('play', () => {
            videoContainer.classList.add('playing');
            if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="pause" size="20"></i>';
            try { lucide.createIcons(); } catch(e) {}
        });
        
        video.addEventListener('pause', () => {
            videoContainer.classList.remove('playing');
            if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="play" size="20"></i>';
            try { lucide.createIcons(); } catch(e) {}
        });
        
        video.addEventListener('ended', () => {
            videoContainer.classList.remove('playing');
            if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="play" size="20"></i>';
            video.load(); // Reset
            try { lucide.createIcons(); } catch(e) {}
        });
    }

    // Fluctuating viewers count
    if (viewersEl) {
        let viewers = 1428501;
        setInterval(() => {
            const change = Math.floor(Math.random() * 600) - 300;
            viewers += change;
            viewersEl.innerText = viewers.toLocaleString('fr-FR');
        }, 3000);
    }
});
