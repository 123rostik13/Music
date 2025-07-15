// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForDemonstration",
    authDomain: "music-portal-demo.firebaseapp.com",
    databaseURL: "https://music-portal-demo-default-rtdb.firebaseio.com",
    projectId: "music-portal-demo",
    storageBucket: "music-portal-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Генерация уникального ID пользователя (для демонстрации)
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

// Основные элементы DOM
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const volumeSlider = document.getElementById('volume');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const currentTrackName = document.getElementById('current-track-name');
const currentTrackArtist = document.getElementById('current-track-artist');
// const currentTrackImage = document.getElementById('current-track-image');
const favoriteBtn = document.getElementById('favorite-btn');
const downloadBtn = document.getElementById('download-btn');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const musicGrid = document.getElementById('music-grid');
const searchResults = document.getElementById('search-results');
const playlistsGrid = document.getElementById('playlists-grid');
const favoritesList = document.getElementById('favorites-list');
const createPlaylistBtn = document.getElementById('create-playlist');
const playlistModal = document.getElementById('playlist-modal');
const closePlaylistModalBtn = document.getElementById('close-playlist-modal');
const savePlaylistBtn = document.getElementById('save-playlist');
const cancelPlaylistBtn = document.getElementById('cancel-playlist');
const playlistNameInput = document.getElementById('playlist-name');
const playlistDescriptionInput = document.getElementById('playlist-description');
const notificationsContainer = document.getElementById('notifications');

// Элементы для системы отзывов
const reviewModal = document.getElementById('review-modal');
const closeReviewModalBtn = document.getElementById('close-review-modal');
const saveReviewBtn = document.getElementById('save-review');
const cancelReviewBtn = document.getElementById('cancel-review');
const reviewTrackName = document.getElementById('review-track-name');
const reviewTrackArtist = document.getElementById('review-track-artist');
const reviewRating = document.getElementById('review-rating');
const reviewComment = document.getElementById('review-comment');
const reviewsList = document.getElementById('reviews-list');

// Элементы для модального окна выбора плейлиста
const selectPlaylistModal = document.getElementById('select-playlist-modal');
const closeSelectPlaylistModalBtn = document.getElementById('close-select-playlist-modal');
const selectPlaylistTrackName = document.getElementById('select-playlist-track-name');
const selectPlaylistTrackArtist = document.getElementById('select-playlist-track-artist');
const playlistsList = document.getElementById('playlists-list');
const noPlaylistsMessage = document.getElementById('no-playlists-message');
const createNewPlaylistBtn = document.getElementById('create-new-playlist-btn');

// Элементы для страницы содержимого плейлиста
const playlistContentSection = document.getElementById('playlist-content-section');
const backToPlaylistsBtn = document.getElementById('back-to-playlists-btn');
const currentPlaylistName = document.getElementById('current-playlist-name');
const currentPlaylistDescription = document.getElementById('current-playlist-description');
const playlistTracks = document.getElementById('playlist-tracks');

// Текущий открытый плейлист
let currentPlaylistId = null;

// Состояние приложения
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
let currentAddToPlaylistTrackId = null; // ID трека для добавления в плейлист
let currentTheme = localStorage.getItem('theme') || 'light';
let reviews = JSON.parse(localStorage.getItem('reviews') || '{}');
let likes = JSON.parse(localStorage.getItem('likes') || '{}');
let currentReviewTrackId = null;

// Данные треков
const tracks = [
    {
        id: 1,
        title: 'Песня про Крым',
        artist: 'Сидоренко Ростислав, Вячеслав Примаков',
        album: 'Крымские мотивы',
        genre: 'folk',
        year: 2024,
        duration: '3:27',
        image: 'https://via.placeholder.com/300x300?text=Крым',
        src: 'songs/krym.mp3',
        plays: 1250,
        likes: 89
    },
    {
        id: 2,
        title: 'Песня про Россию',
        artist: 'Сидоренко Ростислав',
        album: 'Русские мотивы',
        genre: 'folk',
        year: 2024,
        duration: '2:27',
        image: 'https://via.placeholder.com/300x300?text=Россия',
        src: 'songs/russia.mp3',
        plays: 0,
        likes: 0
    },
    {
        id: 3,
        title: 'Свет надежды',
        artist: 'Сидоренко Ростислав',
        album: 'Свет надежды',
        genre: 'folk',
        year: 2024,
        duration: '3:05',
        image: 'https://via.placeholder.com/300x300?text=Свет+надежды',
        src: 'songs/svet.mp3',
        plays: 0,
        likes: 0
    }
];

// Инициализация приложения
function initApp() {
    console.log('Initializing app...');
    
    // Проверяем, что все необходимые элементы существуют
    if (!audioPlayer || !musicGrid) {
        console.error('Required DOM elements not found');
        showNotification('Ошибка инициализации приложения', 'error');
        return;
    }
    
    try {
        // Загружаем данные из localStorage и Firebase
        loadDataFromLocalStorage();
        
        // Настройка слушателей Firebase для обновления в реальном времени
        setupFirebaseListeners();
        
        // Настройка аудио элемента
        audioPlayer.preload = 'metadata';
        audioPlayer.volume = 0.7;
        
        // Глобальные обработчики для аудио
        audioPlayer.addEventListener('ended', () => {
            if (repeatMode === 'one') {
                audioPlayer.currentTime = 0;
                audioPlayer.play();
            } else {
                nextTrack();
            }
        });
        
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', () => {
            if (totalTimeEl && audioPlayer.duration) {
                totalTimeEl.textContent = formatTime(audioPlayer.duration);
            }
        });
        
        setTheme(currentTheme);
        renderMusicGrid();
        renderPlaylists();
        renderFavorites();
        setupEventListeners();
        
        // Адаптация интерфейса под устройство
        adaptInterfaceForDevice();
        
        // Загружаем первый трек без автовоспроизведения
        if (tracks.length > 0) {
            loadTrack(0, false);
        }
        
        // Добавляем обработчик события перед закрытием страницы
        window.addEventListener('beforeunload', saveDataToLocalStorage);
        
        console.log('App initialized successfully');
        showNotification('Приложение успешно загружено', 'success');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Ошибка при инициализации', 'error');
    }
}

// Установка темы
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }
}

// Переключение темы
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Навигация
// Мобильные функции
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    if (!mobileMenuToggle || !sidebar || !mobileOverlay) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Открытие/закрытие мобильного меню
    mobileMenuToggle.addEventListener('click', () => {
        toggleMobileMenu();
    });
    
    // Закрытие меню при клике на оверлей
    mobileOverlay.addEventListener('click', () => {
        closeMobileMenu();
    });
    
    // Закрытие меню при клике на навигационный элемент
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Закрытие меню при изменении размера экрана
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
        // Переадаптация интерфейса при изменении размера
        adaptInterfaceForDevice();
    });
    
    // Обработка свайпов для мобильного меню
    setupMobileSwipes();
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    if (sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    sidebar.classList.add('mobile-open');
    mobileOverlay.style.display = 'block';
    setTimeout(() => {
        mobileOverlay.classList.add('active');
    }, 10);
    
    // Предотвращаем прокрутку фона
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    sidebar.classList.remove('mobile-open');
    mobileOverlay.classList.remove('active');
    
    setTimeout(() => {
        mobileOverlay.style.display = 'none';
    }, 300);
    
    // Восстанавливаем прокрутку фона
    document.body.style.overflow = '';
}

function setupMobileSwipes() {
    let startX = 0;
    let startY = 0;
    let isSwipeActive = false;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwipeActive = true;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isSwipeActive) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;
        
        // Проверяем, что это горизонтальный свайп
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0 && startX < 50 && window.innerWidth <= 768) {
                // Свайп вправо от левого края - открываем меню
                openMobileMenu();
                isSwipeActive = false;
            } else if (diffX < -50) {
                // Свайп влево - закрываем меню
                const sidebar = document.querySelector('.sidebar');
                if (sidebar.classList.contains('mobile-open')) {
                    closeMobileMenu();
                    isSwipeActive = false;
                }
            }
        }
    });
    
    document.addEventListener('touchend', () => {
        isSwipeActive = false;
    });
}

// Функция для определения мобильного устройства
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Функция для адаптации интерфейса под устройство
function adaptInterfaceForDevice() {
    const isMobile = isMobileDevice();
    const playerContainer = document.querySelector('.player-container');
    const mainContent = document.querySelector('.main-content');
    
    if (isMobile) {
        // Добавляем отступ снизу для мобильного плеера
        if (mainContent) {
            mainContent.style.paddingBottom = '120px';
        }
        
        // Оптимизируем размеры кнопок для сенсорного управления
        const controlBtns = document.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
    } else {
        if (mainContent) {
            mainContent.style.paddingBottom = '';
        }
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('page-title');
    const searchContainer = document.querySelector('.search-container');
    const playerContainer = document.querySelector('.player-container');

    if (navItems.length === 0) {
        console.warn('No navigation items found');
        return;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;
            
            if (!targetSection) {
                console.warn('Navigation item missing data-section attribute');
                return;
            }
            
            // Показываем или скрываем поиск
            if (searchContainer) {
                if (targetSection === 'search') {
                    searchContainer.classList.remove('hidden');
                } else {
                    searchContainer.classList.add('hidden');
                }
            }
            
            // Управление отображением плеера
            if (playerContainer) {
                // Показываем плеер только если музыка играет
                if (isPlaying) {
                    playerContainer.style.display = 'block';
                } else {
                    playerContainer.style.display = 'none';
                }
            }
            
            // Обновляем активные элементы
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Обновляем секции
            pageSections.forEach(section => section.classList.remove('active'));
            const targetSectionEl = document.getElementById(`${targetSection}-section`);
            if (targetSectionEl) {
                targetSectionEl.classList.add('active');
            }
            
            // Обновляем заголовок
            if (pageTitle) {
                const titles = {
                    home: 'Главная',
                    search: 'Поиск',
                    playlists: 'Плейлисты',
                    favorites: 'Избранное'
                };
                pageTitle.textContent = titles[targetSection] || 'Главная';
            }
        });
    });

    // Скрываем поиск при первоначальной загрузке, если мы не на странице поиска
    const initialActiveSection = document.querySelector('.nav-item.active')?.dataset.section || 'home';
    if (initialActiveSection !== 'search' && searchContainer) {
        searchContainer.classList.add('hidden');
    }
    
    // Скрываем плеер при первоначальной загрузке, если музыка не играет
    if (playerContainer && !isPlaying) {
        playerContainer.style.display = 'none';
    }
}

// Рендеринг сетки музыки
function renderMusicGrid() {
    if (!musicGrid) {
        console.warn('Music grid element not found');
        return;
    }
    
    musicGrid.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const card = createMusicCard(track, index);
        if (card) {
            musicGrid.appendChild(card);
        }
    });
}

// Создание карточки трека
function createMusicCard(track, index) {
    const card = document.createElement('div');
    card.className = 'music-card';
    card.dataset.trackId = track.id;
    
    const isFavorite = favorites.includes(track.id);
    const isLiked = likes[track.id] || false;
    const averageRating = getAverageRating(track.id);
    const trackReviews = reviews[track.id] || [];
    const totalLikes = (track.likes || 0) + (isLiked ? 1 : 0);
    
    card.innerHTML = `
        <div class="music-card-left">
            <span class="track-index">${index + 1}</span>
            <button class="play-pause-indicator">
                <i class="fas fa-play"></i>
            </button>
        </div>
        <div class="music-card-main">
            <div class="music-card-title">${track.title}</div>
            <div class="music-card-artist">${track.artist}</div>
            <div class="track-stats">
                <div class="track-rating">
                    <span class="rating-stars">${averageRating > 0 ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating)) : '☆☆☆☆☆'}</span>
                    <span class="rating-text">${averageRating > 0 ? averageRating.toFixed(1) : 'Нет оценок'}</span>
                    <span class="reviews-count">(${trackReviews.length} отзывов)</span>
                </div>
            </div>
        </div>
        <div class="music-card-right">
            <button class="action-btn like-btn ${isLiked ? 'active' : ''}" title="Лайк">
                <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                <span class="like-count">${totalLikes}</span>
            </button>
            <button class="action-btn review-btn desktop-only" title="Оставить отзыв">
                <i class="fas fa-star"></i>
            </button>
            <button class="action-btn favorite ${isFavorite ? 'active' : ''} desktop-only" title="Добавить в избранное">
                <i class="fas fa-heart"></i>
            </button>
            <span class="track-duration">${track.duration}</span>
            <div class="more-actions">
                <button class="action-btn more-btn">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
                <div class="more-actions-menu">
                    <button class="menu-item add-playlist-btn"><i class="fas fa-plus"></i> Добавить в плейлист</button>
                    <button class="menu-item download-btn"><i class="fas fa-download"></i> Скачать</button>
                    <button class="menu-item review-btn-mobile"><i class="fas fa-star"></i> Оставить отзыв</button>
                    <button class="menu-item favorite-btn-mobile ${isFavorite ? 'active' : ''}"><i class="fas fa-heart"></i> ${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}</button>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    const playPauseIndicator = card.querySelector('.play-pause-indicator');
    playPauseIndicator.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentTrackIndex === index) {
            // Если это текущий трек, переключаем воспроизведение/паузу
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                playTrack();
            }
        } else {
            // Если это другой трек, загружаем и воспроизводим его
            loadTrack(index);
        }
        updateActiveCard();
    });

    // Клик на карточку только загружает трек без автовоспроизведения
    card.addEventListener('click', () => {
        if (currentTrackIndex !== index) {
            loadTrack(index, false); // false = не автовоспроизведение
        }
    });

    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(track.id);
    });

    const reviewBtn = card.querySelector('.review-btn');
    reviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openReviewModal(track.id);
    });

    const favoriteBtn = card.querySelector('.action-btn.favorite');
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(track.id);
    });

    const moreBtn = card.querySelector('.more-btn');
    const moreMenu = card.querySelector('.more-actions-menu');
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other menus before opening a new one
        document.querySelectorAll('.more-actions-menu.active').forEach(menu => {
            if (menu !== moreMenu) {
                menu.classList.remove('active');
            }
        });
        moreMenu.classList.toggle('active');
    });

    const addPlaylistBtn = card.querySelector('.add-playlist-btn');
    addPlaylistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSelectPlaylistModal(track.id);
        moreMenu.classList.remove('active');
    });

    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = track.src;
        link.download = `${track.artist} - ${track.title}.mp3`;
        link.click();
        showNotification('Начинается скачивание...', 'success');
        moreMenu.classList.remove('active');
    });

    const reviewBtnMobile = card.querySelector('.review-btn-mobile');
    reviewBtnMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        openReviewModal(track.id);
        moreMenu.classList.remove('active');
    });

    const favoriteBtnMobile = card.querySelector('.favorite-btn-mobile');
    favoriteBtnMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(track.id);
        moreMenu.classList.remove('active');
        
        // Обновляем текст кнопки
        const isFavoriteNow = favorites.includes(track.id);
        favoriteBtnMobile.innerHTML = `<i class="fas fa-heart"></i> ${isFavoriteNow ? 'Удалить из избранного' : 'Добавить в избранное'}`;
        favoriteBtnMobile.classList.toggle('active', isFavoriteNow);
    });
    
    return card;
}

// Форматирование чисел
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Загрузка трека
function loadTrack(index, autoplay = true) {
    if (index < 0 || index >= tracks.length) return;
    
    currentTrackIndex = index;
    const track = tracks[index];
    
    // Сбрасываем предыдущие обработчики
    audioPlayer.removeEventListener('canplay', handleCanPlay);
    audioPlayer.removeEventListener('error', handleAudioError);
    audioPlayer.removeEventListener('loadstart', handleLoadStart);
    
    // Добавляем обработчики событий
    audioPlayer.addEventListener('canplay', handleCanPlay);
    audioPlayer.addEventListener('error', handleAudioError);
    audioPlayer.addEventListener('loadstart', handleLoadStart);
    
    audioPlayer.src = track.src;
    currentTrackName.textContent = track.title;
    currentTrackArtist.textContent = track.artist;
    // currentTrackImage.src = track.image;
    
    // Обновляем состояние кнопки избранного
    updateFavoriteButton(track.id);
    
    // Обновляем активную карточку
    updateActiveCard();
    
    if (autoplay) {
        // Задержка для корректной загрузки
        setTimeout(() => {
            playTrack();
        }, 100);
    }
}

// Воспроизведение/пауза
function playTrack() {
    const playerContainer = document.querySelector('.player-container');
    
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.error('Ошибка воспроизведения:', error);
            showNotification('Ошибка воспроизведения аудио', 'error');
            // Попробуем следующий трек
            nextTrack();
        });
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        // Показываем плеер при запуске песни
        if (playerContainer) {
            playerContainer.style.display = 'block';
        }
    } else {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        // НЕ скрываем плеер при паузе - пользователь может взаимодействовать с другими кнопками
        // Плеер остается видимым для управления
    }
    updateActiveCard();
}

// Обработчики событий аудио
function handleCanPlay() {
    console.log('Аудио готово к воспроизведению');
}

function handleAudioError(event) {
    console.error('Ошибка загрузки аудио:', event);
    showNotification('Ошибка загрузки аудиофайла', 'error');
    // Автоматически переходим к следующему треку при ошибке
    setTimeout(() => {
        nextTrack();
    }, 1000);
}

function handleLoadStart() {
    console.log('Начата загрузка аудио');
}

// Обновление прогресс-бара
function updateProgress() {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    const progressPercent = (currentTime / duration) * 100;
    
    // Обновляем прогресс-бар
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = progressPercent + '%';
    }
    
    // Обновляем текущее время
    const currentTimeEl = document.getElementById('current-time');
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentTime);
    }
}

// Следующий трек
function nextTrack() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= tracks.length) {
        if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            return;
        }
    }
    loadTrack(nextIndex);
    
    // Показываем плеер при переключении трека
    const playerContainer = document.querySelector('.player-container');
    if (playerContainer) {
        playerContainer.style.display = 'block';
    }
    
    playTrack();
}

// Предыдущий трек
function prevTrack() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
        if (repeatMode === 'all') {
            prevIndex = tracks.length - 1;
        } else {
            return;
        }
    }
    loadTrack(prevIndex);
    
    // Показываем плеер при переключении трека
    const playerContainer = document.querySelector('.player-container');
    if (playerContainer) {
        playerContainer.style.display = 'block';
    }
    
    playTrack();
}

// Переключение избранного
function toggleFavorite(trackId) {
    const index = favorites.indexOf(trackId);
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Удалено из избранного', 'warning');
    } else {
        favorites.push(trackId);
        showNotification('Добавлено в избранное', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Используем общую функцию для сохранения всех данных
    saveDataToLocalStorage();
    
    updateFavoriteButton(trackId);
    renderFavorites();
    
    // Обновляем все карточки
    const cards = document.querySelectorAll(`[data-track-id="${trackId}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.favorite');
        btn.classList.toggle('active');
    });
}

// Обновление кнопки избранного
function updateFavoriteButton(trackId) {
    const isFavorite = favorites.includes(trackId);
    favoriteBtn.className = `control-btn ${isFavorite ? 'active' : ''}`;
    favoriteBtn.innerHTML = `<i class="fas fa-heart"></i>`;
}

// Обновление активной карточки
function updateActiveCard() {
    const cards = document.querySelectorAll('.music-card');
    cards.forEach((card, index) => {
        const playPauseIndicator = card.querySelector('.play-pause-indicator i');
        if (index === currentTrackIndex) {
            card.classList.add('active');
            if (isPlaying) {
                playPauseIndicator.className = 'fas fa-pause';
            } else {
                playPauseIndicator.className = 'fas fa-play';
            }
        } else {
            card.classList.remove('active');
            playPauseIndicator.className = 'fas fa-play';
        }
    });
}

// Рендеринг плейлистов
function renderPlaylists() {
    playlistsGrid.innerHTML = '';
    
    if (playlists.length === 0) {
        playlistsGrid.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-list" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Нет плейлистов</h3>
                <p>Создайте свой первый плейлист</p>
            </div>
        `;
        return;
    }
    
    playlists.forEach(playlist => {
        const card = createPlaylistCard(playlist);
        playlistsGrid.appendChild(card);
    });
}

// Создание карточки плейлиста
function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    
    card.innerHTML = `
        <div class="playlist-header">
            <div class="playlist-icon">
                <i class="fas fa-list"></i>
            </div>
            <div class="playlist-info">
                <h3>${playlist.name}</h3>
                <p>${playlist.description || 'Без описания'}</p>
            </div>
            <button class="playlist-delete-btn" title="Удалить плейлист">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="playlist-stats">
            <span>${playlist.tracks.length} треков</span>
            <span>Создан ${new Date(playlist.createdAt).toLocaleDateString()}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        openPlaylistContent(playlist.id);
    });

    // Кнопка удаления
    const deleteBtn = card.querySelector('.playlist-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Удалить плейлист "${playlist.name}"?`)) {
            deletePlaylist(playlist.id);
        }
    });
    
    return card;
}

function deletePlaylist(playlistId) {
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
        const name = playlists[index].name;
        playlists.splice(index, 1);
        localStorage.setItem('playlists', JSON.stringify(playlists));
        saveDataToLocalStorage();
        renderPlaylists();
        
        // Если удаляется текущий открытый плейлист, возвращаемся на страницу плейлистов
        if (currentPlaylistId === playlistId) {
            // Переключаемся обратно на страницу плейлистов
            const pageSections = document.querySelectorAll('.page-section');
            pageSections.forEach(section => section.classList.remove('active'));
            document.getElementById('playlists-section').classList.add('active');
            
            // Обновляем заголовок страницы
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = 'Плейлисты';
            }
            
            // Сбрасываем текущий плейлист
            currentPlaylistId = null;
        }
        
        showNotification(`Плейлист "${name}" удалён`, 'success');
    }
}

// Рендеринг избранного
function renderFavorites() {
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-heart" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Нет избранных треков</h3>
                <p>Добавляйте треки в избранное, чтобы быстро к ним обращаться</p>
            </div>
        `;
        return;
    }
    
    const favoriteTracks = tracks.filter(track => favorites.includes(track.id));
    favoriteTracks.forEach((track, index) => {
        const card = createMusicCard(track, tracks.indexOf(track));
        favoritesList.appendChild(card);
    });
}

// Создание плейлиста
function createPlaylist() {
    const name = playlistNameInput.value.trim();
    const description = playlistDescriptionInput.value.trim();
    
    if (!name) {
        showNotification('Введите название плейлиста', 'error');
        return;
    }
    
    const playlist = {
        id: Date.now(),
        name,
        description,
        tracks: [],
        createdAt: new Date().toISOString()
    };
    
    playlists.push(playlist);
    localStorage.setItem('playlists', JSON.stringify(playlists));
    
    // Используем общую функцию для сохранения всех данных
    saveDataToLocalStorage();
    
    renderPlaylists();
    closePlaylistModal();
    showNotification(`Плейлист "${name}" создан`, 'success');
    
    // Очищаем поля
    playlistNameInput.value = '';
    playlistDescriptionInput.value = '';
}

// Закрытие модального окна
function closePlaylistModal() {
    playlistModal.classList.remove('active');
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationsContainer.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Скрываем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Форматирование времени
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    setupNavigation();
    
    // Мобильное меню
    setupMobileMenu();
    
    // Проверяем существование элементов плеера
    if (!playPauseBtn || !prevBtn || !nextBtn) {
        console.error('Player buttons not found');
        return;
    }
    
    // Кнопки плеера
    playPauseBtn.addEventListener('click', playTrack);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    
    // Переключение режимов
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            isShuffled = !isShuffled;
            shuffleBtn.classList.toggle('active', isShuffled);
            showNotification(isShuffled ? 'Перемешивание включено' : 'Перемешивание выключено');
        });
    }
    
    if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(repeatMode);
        repeatMode = modes[(currentIndex + 1) % modes.length];
        
        repeatBtn.classList.remove('active');
        if (repeatMode !== 'none') {
            repeatBtn.classList.add('active');
        }
        
            const messages = {
                none: 'Повтор выключен',
                one: 'Повтор одного трека',
                all: 'Повтор всех треков'
            };
            showNotification(messages[repeatMode]);
        });
    }
    
    // Громкость
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value;
        });
    }
    
    // Прогресс
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
        });
    }
    
    // Избранное и скачивание
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            const currentTrack = tracks[currentTrackIndex];
            toggleFavorite(currentTrack.id);
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const currentTrack = tracks[currentTrackIndex];
            const link = document.createElement('a');
            link.href = currentTrack.src;
            link.download = `${currentTrack.artist} - ${currentTrack.title}.mp3`;
            link.click();
            showNotification('Начинается скачивание...', 'success');
        });
    }
    
    // Переключение темы
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Поиск
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                const filteredTracks = tracks.filter(track => 
                    track.title.toLowerCase().includes(query) ||
                    track.artist.toLowerCase().includes(query) ||
                    track.album.toLowerCase().includes(query)
                );
                renderSearchResults(filteredTracks);
            } else {
                searchResults.innerHTML = '';
            }
        });
    }
    
    // Модальное окно плейлиста
    if (createPlaylistBtn && playlistModal) {
        createPlaylistBtn.addEventListener('click', () => {
            playlistModal.classList.add('active');
        });
    }
    
    if (closePlaylistModalBtn) {
        closePlaylistModalBtn.addEventListener('click', closePlaylistModal);
    }
    
    if (cancelPlaylistBtn) {
        cancelPlaylistBtn.addEventListener('click', closePlaylistModal);
    }
    
    if (savePlaylistBtn) {
        savePlaylistBtn.addEventListener('click', createPlaylist);
    }
    
    // Закрытие модального окна по клику вне его
    playlistModal.addEventListener('click', (e) => {
        if (e.target === playlistModal) {
            closePlaylistModal();
        }
    });

    // Модальное окно отзывов
    if (closeReviewModalBtn) {
        closeReviewModalBtn.addEventListener('click', closeReviewModal);
    }
    
    if (cancelReviewBtn) {
        cancelReviewBtn.addEventListener('click', closeReviewModal);
    }
    
    if (saveReviewBtn) {
        saveReviewBtn.addEventListener('click', saveReview);
    }
    
    // Модальное окно выбора плейлиста
    if (closeSelectPlaylistModalBtn) {
        closeSelectPlaylistModalBtn.addEventListener('click', closeSelectPlaylistModal);
    }
    
    // Закрытие модального окна выбора плейлиста по клику вне его
    if (selectPlaylistModal) {
        selectPlaylistModal.addEventListener('click', (e) => {
            if (e.target === selectPlaylistModal) {
                closeSelectPlaylistModal();
            }
        });
    }
    
    // Кнопка создания нового плейлиста из модального окна выбора плейлиста
    if (createNewPlaylistBtn) {
        createNewPlaylistBtn.addEventListener('click', () => {
            closeSelectPlaylistModal();
            playlistModal.classList.add('active');
        });
    }
    
    // Кнопка возврата к плейлистам
    if (backToPlaylistsBtn) {
        backToPlaylistsBtn.addEventListener('click', () => {
            // Переключаемся обратно на страницу плейлистов
            const pageSections = document.querySelectorAll('.page-section');
            pageSections.forEach(section => section.classList.remove('active'));
            document.getElementById('playlists-section').classList.add('active');
            
            // Обновляем заголовок страницы
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = 'Плейлисты';
            }
            
            // Сбрасываем текущий плейлист
            currentPlaylistId = null;
        });
    }
    
    // Закрытие модального окна отзывов по клику вне его
    if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                closeReviewModal();
            }
        });
    }

    // Close "more actions" menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.more-actions')) {
            document.querySelectorAll('.more-actions-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });

    // Примечание: основные обработчики аудио настроены в initApp()
    
    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                playTrack();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextTrack();
                break;
        }
    });
}

// Рендеринг результатов поиска
function renderSearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос</p>
            </div>
        `;
        return;
    }
    
    results.forEach((track, index) => {
        const card = createMusicCard(track, tracks.indexOf(track));
        searchResults.appendChild(card);
    });
}

// Функции для работы с лайками
function toggleLike(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    const isLiked = likes[trackId] || false;
    
    if (isLiked) {
        delete likes[trackId];
        showNotification('Лайк убран', 'info');
    } else {
        likes[trackId] = true;
        showNotification('Трек понравился!', 'success');
    }
    
    // Обновляем отображение
    updateLikeDisplay(trackId);
    
    // Сохраняем в Firebase
    const trackLikeRef = database.ref(`likes/${trackId}/${userId}`);
    if (isLiked) {
        // Если был лайк, удаляем его
        trackLikeRef.remove()
            .then(() => {
                console.log(`Лайк для трека ${trackId} удален`);
            })
            .catch(error => {
                console.error('Ошибка при удалении лайка:', error);
            });
    } else {
        // Если не было лайка, добавляем его
        trackLikeRef.set(true)
            .then(() => {
                console.log(`Лайк для трека ${trackId} добавлен`);
            })
            .catch(error => {
                console.error('Ошибка при добавлении лайка:', error);
            });
    }
}
    
    // Сохраняем локально для быстрого доступа
    localStorage.setItem('likes', JSON.stringify(likes));
    
    // Используем общую функцию для сохранения всех данных
    saveDataToLocalStorage();
function createMusicCard(track, index) {
    const card = document.createElement('div');
    card.className = 'music-card';
    card.dataset.trackId = track.id;
    
    const isFavorite = favorites.includes(track.id);
    const isLiked = likes[track.id] || false;
    const averageRating = getAverageRating(track.id);
    const trackReviews = reviews[track.id] || [];
    const totalLikes = (track.likes || 0) + (isLiked ? 1 : 0);
    
    card.innerHTML = `
        <div class="music-card-left">
            <span class="track-index">${index + 1}</span>
            <button class="play-pause-indicator">
                <i class="fas fa-play"></i>
            </button>
        </div>
        <div class="music-card-main">
            <div class="music-card-title">${track.title}</div>
            <div class="music-card-artist">${track.artist}</div>
            <div class="track-stats">
                <div class="track-rating">
                    <span class="rating-stars">${averageRating > 0 ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating)) : '☆☆☆☆☆'}</span>
                    <span class="rating-text">${averageRating > 0 ? averageRating.toFixed(1) : 'Нет оценок'}</span>
                    <span class="reviews-count">(${trackReviews.length} отзывов)</span>
                </div>
            </div>
        </div>
        <div class="music-card-right">
            <button class="action-btn like-btn ${isLiked ? 'active' : ''}" title="Лайк">
                <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                <span class="like-count">${totalLikes}</span>
            </button>
            <button class="action-btn review-btn desktop-only" title="Оставить отзыв">
                <i class="fas fa-comment"></i>
            </button>
            <button class="action-btn add-to-playlist-btn desktop-only" title="Добавить в плейлист">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const playPauseIndicator = card.querySelector('.play-pause-indicator');
    playPauseIndicator.addEventListener('click', () => {
        loadTrack(index, true);
    });
    
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => {
        toggleLike(track.id);
    });
    
    const reviewBtn = card.querySelector('.review-btn');
    reviewBtn.addEventListener('click', () => {
        openReviewModal(track.id);
    });
    
    const addToPlaylistBtn = card.querySelector('.add-to-playlist-btn');
    addToPlaylistBtn.addEventListener('click', () => {
        openSelectPlaylistModal(track.id);
    });
    
    return card;
}

function updateLikeDisplay(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    const isLiked = likes[trackId] || false;
    
    // Обновляем кнопку лайка в карточке
    const likeBtn = document.querySelector(`[data-track-id="${trackId}"] .like-btn`);
    if (likeBtn) {
        const icon = likeBtn.querySelector('i');
        const count = likeBtn.querySelector('.like-count');
        
        if (isLiked) {
            icon.className = 'fas fa-heart';
            likeBtn.classList.add('active');
        } else {
            icon.className = 'far fa-heart';
            likeBtn.classList.remove('active');
        }
        
        if (count) {
            // Подсчитываем общее количество лайков от всех пользователей
            // Получаем количество лайков из Firebase
            const trackLikesRef = database.ref(`likes/${trackId}`);
            trackLikesRef.once('value')
                .then(snapshot => {
                    // Получаем данные лайков из Firebase
                    const likesData = snapshot.val() || {};
                    // Считаем количество лайков для данного трека
                    const likesCount = Object.keys(likesData).length;
                    // Показываем общее количество лайков (базовые + от пользователей)
                    const totalLikes = (track.likes || 0) + likesCount;
                    count.textContent = totalLikes;
                })
                .catch(error => {
                    console.error('Ошибка при получении лайков из Firebase:', error);
                    // В случае ошибки показываем только базовые лайки
                    count.textContent = track.likes || 0;
                });
        }
    }
    
    // Обновляем кнопку в плеере, если это текущий трек
    if (currentTrackIndex >= 0 && tracks[currentTrackIndex].id === trackId) {
        const playerLikeBtn = document.getElementById('favorite-btn');
        if (playerLikeBtn) {
            const icon = playerLikeBtn.querySelector('i');
            if (isLiked) {
                icon.className = 'fas fa-heart';
                playerLikeBtn.classList.add('active');
            } else {
                icon.className = 'far fa-heart';
                playerLikeBtn.classList.remove('active');
            }
        }
    }
    
    // Обновляем общую статистику трека
    updateTrackStats();
}

// Функции для работы с отзывами
function openReviewModal(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    currentReviewTrackId = trackId;
    reviewTrackName.textContent = track.title;
    reviewTrackArtist.textContent = track.artist;
    reviewRating.value = 5;
    reviewComment.value = '';
    
    // Показываем существующие отзывы
    renderTrackReviews(trackId);
    
    reviewModal.classList.add('active');
}

function closeReviewModal() {
    reviewModal.classList.remove('active');
    currentReviewTrackId = null;
}

function saveReview() {
    if (!currentReviewTrackId) return;
    
    const rating = parseInt(reviewRating.value);
    const comment = reviewComment.value.trim();
    
    if (rating < 1 || rating > 5) {
        showNotification('Пожалуйста, выберите оценку от 1 до 5', 'error');
        return;
    }
    
    if (!comment) {
        showNotification('Пожалуйста, оставьте комментарий', 'error');
        return;
    }
    
    // Создаем новый отзыв
    const reviewId = Date.now();
    const review = {
        id: reviewId,
        trackId: currentReviewTrackId,
        rating: rating,
        comment: comment,
        date: new Date().toISOString(),
        author: 'Пользователь' // В реальном приложении здесь было бы имя пользователя
    };
    
    // Добавляем отзыв к треку
    if (!reviews[currentReviewTrackId]) {
        reviews[currentReviewTrackId] = [];
    }
    reviews[currentReviewTrackId].push(review);
    
    // Сохраняем локально
    localStorage.setItem('reviews', JSON.stringify(reviews));
    saveDataToLocalStorage();
    
    // Обновляем отображение
    renderTrackReviews(currentReviewTrackId);
    updateTrackStats();
    
    // Показываем уведомление и закрываем модальное окно
    showNotification('Отзыв добавлен!', 'success');
    closeReviewModal();
    
    // Сохраняем в Firebase
    console.log('Сохранение отзыва в Firebase');
    console.log('Данные отзыва:', review);
    
    try {
        // Получаем ссылку на отзывы для данного трека
        const reviewRef = database.ref(`reviews/${currentReviewTrackId}`);
        
        // Добавляем новый отзыв в список отзывов для трека
        reviewRef.child(reviewId).set(review)
            .then(() => {
                console.log(`Отзыв для трека ${currentReviewTrackId} сохранен в Firebase`);
            })
            .catch(error => {
                console.error('Ошибка при сохранении отзыва в Firebase:', error);
                console.error('Детали ошибки:', error.message, error.stack);
                showNotification('Отзыв сохранен локально, но возникла ошибка при сохранении в Firebase', 'warning');
            });
    } catch (error) {
        console.error('Ошибка при работе с Firebase:', error);
        console.error('Детали ошибки:', error.message, error.stack);
    }
}

function renderTrackReviews(trackId) {
    // Показываем индикатор загрузки
    reviewsList.innerHTML = '<p class="loading-reviews">Загрузка отзывов...</p>';
    
    // Получаем отзывы из Firebase
    const reviewsRef = database.ref(`reviews/${trackId}`);
    reviewsRef.once('value')
        .then(snapshot => {
            const data = snapshot.val() || {};
            
            // Преобразуем объект отзывов в массив
            const allReviews = Object.values(data);
            
            if (allReviews.length === 0) {
                reviewsList.innerHTML = '<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>';
                return;
            }
            
            reviewsList.innerHTML = allReviews
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(review => `
                    <div class="review-item" data-review-id="${review.id}">
                        <div class="review-header">
                            <div class="review-rating">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            </div>
                            <div class="review-date">${formatDate(review.date)}</div>
                        </div>
                        <div class="review-comment">${review.comment}</div>
                        <div class="review-author">${review.author}</div>
                    </div>
                `).join('');
        })
        .catch(error => {
            console.error('Ошибка при получении отзывов:', error);
            // В случае ошибки показываем локальные отзывы
            const localReviews = reviews[trackId] || [];
            
            if (localReviews.length === 0) {
                reviewsList.innerHTML = '<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>';
                return;
            }
            
            reviewsList.innerHTML = localReviews
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(review => `
                    <div class="review-item" data-review-id="${review.id}">
                        <div class="review-header">
                            <div class="review-rating">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            </div>
                            <div class="review-date">${formatDate(review.date)}</div>
                        </div>
                        <div class="review-comment">${review.comment}</div>
                        <div class="review-author">${review.author}</div>
                    </div>
                `).join('');
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getAverageRating(trackId) {
    // Эта функция используется только как запасной вариант при ошибках Firebase
    // Получаем локальные отзывы
    const trackReviews = reviews[trackId] || [];
    if (trackReviews.length === 0) return 0;
    
    const totalRating = trackReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / trackReviews.length) * 10) / 10;
}

// Обновление отображения рейтингов и отзывов
function updateTrackStats() {
    tracks.forEach(track => {
        const card = document.querySelector(`[data-track-id="${track.id}"]`);
        if (!card) return;
        
        const ratingStars = card.querySelector('.rating-stars');
        const ratingText = card.querySelector('.rating-text');
        const reviewsCount = card.querySelector('.reviews-count');
        const likeCount = card.querySelector('.like-count');
        
        // Получаем отзывы из Firebase
        const trackReviewsRef = database.ref(`reviews/${track.id}`);
        trackReviewsRef.once('value')
            .then(snapshot => {
                const data = snapshot.val() || {};
                // Преобразуем объект отзывов в массив
                const allReviews = Object.values(data);
                
                // Вычисляем средний рейтинг
                let averageRating = 0;
                if (allReviews.length > 0) {
                    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
                    averageRating = Math.round((totalRating / allReviews.length) * 10) / 10;
                }
                
                // Обновляем отображение рейтинга
                if (ratingStars) {
                    ratingStars.textContent = averageRating > 0 ? 
                        '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating)) : 
                        '☆☆☆☆☆';
                }
                
                if (ratingText) {
                    ratingText.textContent = averageRating > 0 ? 
                        averageRating.toFixed(1) : 
                        'Нет оценок';
                }
                
                if (reviewsCount) {
                    reviewsCount.textContent = `(${allReviews.length} отзывов)`;
                }
                
                // Получаем лайки из Firebase
                const trackLikesRef = database.ref(`likes/${track.id}`);
                trackLikesRef.once('value')
                    .then(snapshot => {
                        // Получаем данные лайков из Firebase
                        const likesData = snapshot.val() || {};
                        // Считаем количество лайков для данного трека
                        const likesCount = Object.keys(likesData).length;
                        // Показываем общее количество лайков (базовые + от пользователей)
                        const totalLikes = (track.likes || 0) + likesCount;
                        
                        if (likeCount) {
                            likeCount.textContent = totalLikes;
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка при получении лайков из Firebase:', error);
                        // В случае ошибки показываем только базовые лайки
                        if (likeCount) {
                            likeCount.textContent = track.likes || 0;
                        }
                    });
            })
            .catch(error => {
                console.error('Ошибка при получении отзывов:', error);
                // В случае ошибки используем локальные данные
                const localReviews = reviews[track.id] || [];
                const averageRating = getAverageRating(track.id);
                const isLiked = likes[track.id] || false;
                const totalLikes = (track.likes || 0) + (isLiked ? 1 : 0);
                
                if (ratingStars) {
                    ratingStars.textContent = averageRating > 0 ? 
                        '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating)) : 
                        '☆☆☆☆☆';
                }
                
                if (ratingText) {
                    ratingText.textContent = averageRating > 0 ? 
                        averageRating.toFixed(1) : 
                        'Нет оценок';
                }
                
                if (reviewsCount) {
                    reviewsCount.textContent = `(${localReviews.length} отзывов)`;
                }
                
                if (likeCount) {
                    likeCount.textContent = totalLikes;
                }
            });
    });
}

// Функция для загрузки данных из Firebase и localStorage
function loadDataFromLocalStorage() {
    // Загружаем избранные треки (только из localStorage)
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
    
    // Загружаем плейлисты (только из localStorage)
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
        playlists = JSON.parse(savedPlaylists);
    }
    
    // Загружаем лайки из Firebase
    const likesRef = database.ref('likes');
    likesRef.once('value')
        .then(snapshot => {
            const data = snapshot.val() || {};
            // Преобразуем структуру данных из Firebase в формат приложения
            likes = {};
            Object.keys(data).forEach(trackId => {
                // Проверяем, есть ли лайк от текущего пользователя
                if (data[trackId][userId]) {
                    likes[trackId] = true;
                }
            });
            // Сохраняем в localStorage для быстрого доступа
            localStorage.setItem('likes', JSON.stringify(likes));
            // Обновляем отображение
            updateTrackStats();
        })
        .catch(error => {
            console.error('Ошибка при загрузке лайков из Firebase:', error);
            // Если не удалось загрузить из Firebase, используем localStorage
            const savedLikes = localStorage.getItem('likes');
            if (savedLikes) {
                likes = JSON.parse(savedLikes);
            }
        });
    
    // Загружаем отзывы из Firebase
    const reviewsRef = database.ref('reviews');
    reviewsRef.once('value')
        .then(snapshot => {
            const data = snapshot.val() || {};
            // Преобразуем структуру данных из Firebase в формат приложения
            reviews = {};
            Object.keys(data).forEach(trackId => {
                reviews[trackId] = data[trackId];
            });
            // Сохраняем в localStorage для быстрого доступа
            localStorage.setItem('reviews', JSON.stringify(reviews));
            // Обновляем отображение
            updateTrackStats();
        })
        .catch(error => {
            console.error('Ошибка при загрузке отзывов из Firebase:', error);
            // Если не удалось загрузить из Firebase, используем localStorage
            const savedReviews = localStorage.getItem('reviews');
            if (savedReviews) {
                reviews = JSON.parse(savedReviews);
            }
        });
    
    console.log('Data loading started');
}

// Функция для сохранения данных в localStorage
function saveDataToLocalStorage() {
    // Сохраняем избранные треки
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Сохраняем плейлисты
    localStorage.setItem('playlists', JSON.stringify(playlists));
    
    // Сохраняем лайки
    localStorage.setItem('likes', JSON.stringify(likes));
    
    // Сохраняем отзывы
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    console.log('Data saved to localStorage');
}

// Настройка периодического обновления данных с сервера
function setupFirebaseListeners() {
    console.log('Настройка слушателей Firebase...');
    
    // Слушатель для лайков
    const likesRef = database.ref('likes');
    likesRef.on('value', (snapshot) => {
        const data = snapshot.val() || {};
        console.log('Получены данные о лайках:', data);
        
        // Преобразуем структуру данных Firebase в формат приложения
        likes = {};
        Object.keys(data).forEach(trackId => {
            // Проверяем, есть ли лайк от текущего пользователя
            if (data[trackId][userId]) {
                likes[trackId] = true;
            }
        });
        
        // Сохраняем в localStorage для быстрого доступа
        localStorage.setItem('likes', JSON.stringify(likes));
        
        // Обновляем отображение
        updateTrackStats();
    }, (error) => {
        console.error('Ошибка при получении лайков из Firebase:', error);
    });
    
    // Слушатель для отзывов
    const reviewsRef = database.ref('reviews');
    reviewsRef.on('value', (snapshot) => {
        const data = snapshot.val() || {};
        console.log('Получены данные об отзывах:', data);
        
        // Преобразуем структуру данных Firebase в формат приложения
        reviews = data;
        
        // Сохраняем в localStorage для быстрого доступа
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // Обновляем отображение
        updateTrackStats();
        
        // Если открыто модальное окно с отзывами, обновляем его
        if (currentReviewTrackId && reviewModal.classList.contains('active')) {
            renderTrackReviews(currentReviewTrackId);
        }
    }, (error) => {
        console.error('Ошибка при получении отзывов из Firebase:', error);
    });
}

// Функции для работы с плейлистами
function openSelectPlaylistModal(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    currentAddToPlaylistTrackId = trackId;
    
    // Заполняем информацию о треке
    selectPlaylistTrackName.textContent = track.title;
    selectPlaylistTrackArtist.textContent = track.artist;
    
    // Рендерим список плейлистов
    renderPlaylistsForSelection();
    
    // Показываем модальное окно
    selectPlaylistModal.classList.add('active');
}

function closeSelectPlaylistModal() {
    selectPlaylistModal.classList.remove('active');
    currentAddToPlaylistTrackId = null;
}

function renderPlaylistsForSelection() {
    if (playlists.length === 0) {
        playlistsList.style.display = 'none';
        noPlaylistsMessage.style.display = 'block';
        return;
    }
    
    playlistsList.style.display = 'flex';
    noPlaylistsMessage.style.display = 'none';
    
    playlistsList.innerHTML = playlists.map(playlist => {
        const trackCount = playlist.tracks.length;
        return `
            <div class="playlist-select-item" data-playlist-id="${playlist.id}">
                <div class="playlist-info">
                    <div class="playlist-name">${playlist.name}</div>
                    <div class="playlist-tracks-count">${trackCount} ${getTrackWord(trackCount)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Добавляем обработчики событий для выбора плейлиста
    const playlistItems = playlistsList.querySelectorAll('.playlist-select-item');
    playlistItems.forEach(item => {
        item.addEventListener('click', () => {
            const playlistId = parseInt(item.dataset.playlistId);
            addTrackToPlaylist(currentAddToPlaylistTrackId, playlistId);
        });
    });
}

function addTrackToPlaylist(trackId, playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    // Проверяем, есть ли уже этот трек в плейлисте
    if (playlist.tracks.includes(trackId)) {
        showNotification('Этот трек уже добавлен в плейлист', 'info');
        closeSelectPlaylistModal();
        return;
    }
    
    // Добавляем трек в плейлист
    playlist.tracks.push(trackId);
    
    // Сохраняем в localStorage
    localStorage.setItem('playlists', JSON.stringify(playlists));
    
    // Используем общую функцию для сохранения всех данных
    saveDataToLocalStorage();
    
    // Обновляем отображение
    renderPlaylists();
    
    // Если плейлист открыт, обновляем его содержимое
    if (currentPlaylistId === playlistId) {
        renderPlaylistContent(playlist);
    }
    
    // Показываем уведомление
    const track = tracks.find(t => t.id === trackId);
    showNotification(`Трек "${track.title}" добавлен в плейлист "${playlist.name}"`, 'success');
    
    // Закрываем модальное окно
    closeSelectPlaylistModal();
}

function getTrackWord(count) {
    if (count === 1) {
        return 'трек';
    } else if (count >= 2 && count <= 4) {
        return 'трека';
    } else {
        return 'треков';
    }
}

// Функции для работы с содержимым плейлиста
function openPlaylistContent(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    currentPlaylistId = playlistId;
    
    // Заполняем информацию о плейлисте
    currentPlaylistName.textContent = playlist.name;
    currentPlaylistDescription.textContent = playlist.description || 'Без описания';
    
    // Рендерим треки плейлиста
    renderPlaylistContent(playlist);
    
    // Переключаемся на страницу содержимого плейлиста
    const pageSections = document.querySelectorAll('.page-section');
    pageSections.forEach(section => section.classList.remove('active'));
    playlistContentSection.classList.add('active');
    
    // Обновляем заголовок страницы
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = playlist.name;
    }
    
    // Показываем уведомление
    showNotification(`Открыт плейлист: ${playlist.name}`, 'success');
}

function renderPlaylistContent(playlist) {
    playlistTracks.innerHTML = '';
    
    if (playlist.tracks.length === 0) {
        playlistTracks.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-music" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Нет треков</h3>
                <p>В этом плейлисте пока нет треков</p>
            </div>
        `;
        return;
    }
    
    // Получаем треки из плейлиста
    const playlistTrackItems = playlist.tracks.map(trackId => {
        const track = tracks.find(t => t.id === trackId);
        if (!track) return null;
        return track;
    }).filter(track => track !== null);
    
    // Создаем карточки для каждого трека
    playlistTrackItems.forEach((track, index) => {
        const card = createMusicCard(track, tracks.indexOf(track));
        playlistTracks.appendChild(card);
    });
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);