// SONGS DATA
const songsList = [
    {
        id: "loksii",
        title: "Retro Dreams",
        artist: "Loksii",
        album: "Synthwave Odyssey",
        url: "https://res.cloudinary.com/wwycezdi/video/upload/v1782813710/loksii-no-copyright-music-211881_huumiw.mp3",
        cover: "assets/loksii.jpg",
        duration: "2:54",
        releaseDate: "2023-11-14",
        playCount: "1,429,812"
    },
    {
        id: "alexgrohl",
        title: "Bounce On It",
        artist: "Alexgrohl",
        album: "Rock & Roller Coaster",
        url: "https://res.cloudinary.com/wwycezdi/video/upload/v1782813709/alexgrohl-no-copyright-music-bounce-on-it-184234_lgifl2.mp3",
        cover: "assets/alexgrohl.jpg",
        duration: "2:52",
        releaseDate: "2024-01-20",
        playCount: "820,419"
    },
    {
        id: "moodmode",
        title: "Neon Horizon",
        artist: "Moodmode",
        album: "Chill Lounge Sessions",
        url: "https://res.cloudinary.com/wwycezdi/video/upload/v1782813702/moodmode-no-copyright-music-201745_ww81wf.mp3",
        cover: "assets/moodmode.jpg",
        duration: "3:01",
        releaseDate: "2023-08-05",
        playCount: "3,114,802"
    },
    {
        id: "sigmamusicart",
        title: "Apex Legend",
        artist: "Sigma Music Art",
        album: "Cinematic Chronicles",
        url: "https://res.cloudinary.com/wwycezdi/video/upload/v1782813689/sigmamusicart-no-copyright-music-537751_obaqpt.mp3",
        cover: "assets/sigmamusicart.jpg",
        duration: "2:44",
        releaseDate: "2024-03-10",
        playCount: "95,201"
    },
    {
        id: "prettyjohn",
        title: "Midnight Lounge",
        artist: "Pretty John",
        album: "Smooth R&B Anthems",
        url: "https://res.cloudinary.com/wwycezdi/video/upload/v1782813685/prettyjohn1-no-copyright-music-498106_yyqhzh.mp3",
        cover: "assets/prettyjohn.jpg",
        duration: "1:47",
        releaseDate: "2023-12-25",
        playCount: "512,664"
    }
];

// PLAYER STATE
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false; // false = repeat off, true = repeat playlist
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let customPlaylists = JSON.parse(localStorage.getItem('customPlaylists')) || [];
let historyStack = ['home'];
let historyPointer = 0;

// AUDIO OBJECT
const audio = new Audio();
audio.crossOrigin = "anonymous";
audio.volume = 0.7;

// WEB AUDIO VISUALIZER SETUP
let audioCtx = null;
let analyser = null;
let sourceNode = null;
let visualizerTheme = 'neon'; // 'neon', 'wave', 'circular', 'particles'
let particlesArray = [];
let isVisualizerInitialized = false;
let isCorsBlocked = false;

// DOM ELEMENTS
const welcomeGreeting = document.getElementById('welcome-greeting');
const recentGrid = document.getElementById('recent-tracks-grid');
const cardsGrid = document.getElementById('songs-cards-grid');
const homeTracklistRows = document.getElementById('home-tracklist-rows');
const likedTracklistRows = document.getElementById('liked-tracklist-rows');
const likedSongsCountText = document.getElementById('liked-songs-count');
const likedHeroCountText = document.getElementById('liked-hero-count');

// Player Controls
const btnPlayPause = document.getElementById('btn-play-pause');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnShuffle = document.getElementById('btn-shuffle');
const btnRepeat = document.getElementById('btn-repeat');
const playerProgressRange = document.getElementById('player-progress-range');
const playerProgressFill = document.getElementById('player-progress-fill');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

// Player Left Info
const playerAlbumArt = document.getElementById('player-album-art');
const playerTrackTitle = document.getElementById('player-track-title');
const playerTrackArtist = document.getElementById('player-track-artist');
const playerHeartBtn = document.getElementById('player-heart');

// Utilities
const btnVolumeIcon = document.getElementById('btn-volume-icon');
const volumeRange = document.getElementById('volume-range');
const volumeFill = document.getElementById('volume-fill');
const btnToggleVisualizer = document.getElementById('btn-toggle-visualizer');
const btnFullscreen = document.getElementById('btn-fullscreen');

// Navigation Views
const viewHome = document.getElementById('view-home');
const viewSearch = document.getElementById('view-search');
const viewLiked = document.getElementById('view-liked');
const viewVisualizer = document.getElementById('view-visualizer');
const searchInput = document.getElementById('search-input');
const headerSearchBar = document.getElementById('header-search-bar');
const clearSearchBtn = document.getElementById('clear-search');

// Navigation Buttons
const navHome = document.getElementById('nav-home');
const navSearch = document.getElementById('nav-search');
const navLibrary = document.getElementById('nav-library');
const playlistLiked = document.getElementById('playlist-liked');
const navBackBtn = document.getElementById('nav-back-btn');
const navForwardBtn = document.getElementById('nav-forward-btn');

// Profile & Theme
const profileDropdown = document.getElementById('profile-dropdown');
const profileMenu = document.getElementById('profile-menu');
const btnThemeToggle = document.getElementById('btn-theme-toggle');

// Search views
const searchInitialContent = document.getElementById('search-initial-content');
const searchResultsContent = document.getElementById('search-results-content');
const topSearchResult = document.getElementById('top-search-result');
const searchSongsResults = document.getElementById('search-songs-results');

// Liked Songs playlist controls
const playLikedPlaylistBtn = document.getElementById('play-liked-playlist');
const findSongsBtn = document.getElementById('find-songs-btn');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistsList = document.getElementById('playlists-list');

// Canvas
const miniCanvas = document.getElementById('mini-visualizer');
const expandedCanvas = document.getElementById('expanded-visualizer');

// INITIALIZE APP
window.addEventListener('DOMContentLoaded', () => {
    setGreeting();
    loadSong(currentSongIndex, false);
    renderHomeView();
    renderPlaylists();
    updateLikedSongsDisplay();
    setupEventListeners();
    setupCanvasResizing();
});

// GREETING LOGIC
function setGreeting() {
    const hours = new Date().getHours();
    let greeting = "Good day";
    if (hours < 12) greeting = "Good morning";
    else if (hours < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    welcomeGreeting.textContent = greeting;
}

// SETUP VIEW NAVIGATION
function switchView(viewName) {
    // Hide all views
    viewHome.classList.add('hidden');
    viewSearch.classList.add('hidden');
    viewLiked.classList.add('hidden');
    viewVisualizer.classList.add('hidden');
    
    // Deactivate nav items
    navHome.classList.remove('active');
    navSearch.classList.remove('active');
    navLibrary.classList.remove('active');
    playlistLiked.classList.remove('active-playlist');
    btnToggleVisualizer.classList.remove('active-util');

    // Show search bar only on search view
    if (viewName === 'search') {
        headerSearchBar.classList.remove('hidden');
    } else {
        headerSearchBar.classList.add('hidden');
    }

    // Activate selected view
    if (viewName === 'home') {
        viewHome.classList.remove('hidden');
        navHome.classList.add('active');
    } else if (viewName === 'search') {
        viewSearch.classList.remove('hidden');
        navSearch.classList.add('active');
    } else if (viewName === 'liked') {
        viewLiked.classList.remove('hidden');
        playlistLiked.classList.add('active-playlist');
        navLibrary.classList.add('active');
        renderLikedSongsList();
    } else if (viewName === 'visualizer') {
        viewVisualizer.classList.remove('hidden');
        btnToggleVisualizer.classList.add('active-util');
        updateVisualizerOverlay();
    }

    // Manage history stack
    if (historyStack[historyPointer] !== viewName) {
        historyStack = historyStack.slice(0, historyPointer + 1);
        historyStack.push(viewName);
        historyPointer = historyStack.length - 1;
    }
    updateNavButtons();
}

function updateNavButtons() {
    navBackBtn.style.opacity = historyPointer > 0 ? "1" : "0.5";
    navBackBtn.style.cursor = historyPointer > 0 ? "pointer" : "default";
    navForwardBtn.style.opacity = historyPointer < historyStack.length - 1 ? "1" : "0.5";
    navForwardBtn.style.cursor = historyPointer < historyStack.length - 1 ? "pointer" : "default";
}

// NAVIGATION LISTENERS
navHome.addEventListener('click', (e) => { e.preventDefault(); switchView('home'); });
navSearch.addEventListener('click', (e) => { e.preventDefault(); switchView('search'); });
navLibrary.addEventListener('click', (e) => { e.preventDefault(); switchView('liked'); });
playlistLiked.addEventListener('click', (e) => { e.preventDefault(); switchView('liked'); });

navBackBtn.addEventListener('click', () => {
    if (historyPointer > 0) {
        historyPointer--;
        switchViewDirectly(historyStack[historyPointer]);
    }
});

navForwardBtn.addEventListener('click', () => {
    if (historyPointer < historyStack.length - 1) {
        historyPointer++;
        switchViewDirectly(historyStack[historyPointer]);
    }
});

function switchViewDirectly(viewName) {
    // Hide all
    viewHome.classList.add('hidden');
    viewSearch.classList.add('hidden');
    viewLiked.classList.add('hidden');
    viewVisualizer.classList.add('hidden');
    navHome.classList.remove('active');
    navSearch.classList.remove('active');
    navLibrary.classList.remove('active');
    playlistLiked.classList.remove('active-playlist');
    btnToggleVisualizer.classList.remove('active-util');

    if (viewName === 'search') {
        headerSearchBar.classList.remove('hidden');
    } else {
        headerSearchBar.classList.add('hidden');
    }

    if (viewName === 'home') {
        viewHome.classList.remove('hidden');
        navHome.classList.add('active');
    } else if (viewName === 'search') {
        viewSearch.classList.remove('hidden');
        navSearch.classList.add('active');
    } else if (viewName === 'liked') {
        viewLiked.classList.remove('hidden');
        playlistLiked.classList.add('active-playlist');
        navLibrary.classList.add('active');
        renderLikedSongsList();
    } else if (viewName === 'visualizer') {
        viewVisualizer.classList.remove('hidden');
        btnToggleVisualizer.classList.add('active-util');
        updateVisualizerOverlay();
    }
    updateNavButtons();
}

// SETUP CANVAS RESIZING
function setupCanvasResizing() {
    const resizeCanvas = () => {
        miniCanvas.width = miniCanvas.parentElement.clientWidth;
        miniCanvas.height = miniCanvas.parentElement.clientHeight;
        expandedCanvas.width = expandedCanvas.parentElement.clientWidth;
        expandedCanvas.height = expandedCanvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    // Initial call after elements display
    setTimeout(resizeCanvas, 200);
}

// AUDIO ENGINE CONTROLS
function loadSong(index, shouldPlay = true) {
    currentSongIndex = index;
    const song = songsList[index];
    
    audio.src = song.url;
    audio.load();

    // Update UI elements
    playerAlbumArt.src = song.cover;
    playerTrackTitle.textContent = song.title;
    playerTrackArtist.textContent = song.artist;
    
    // Set total time stamp placeholder
    timeTotal.textContent = song.duration;
    timeCurrent.textContent = "0:00";
    playerProgressRange.value = 0;
    playerProgressFill.style.width = "0%";

    // Heart icon status
    if (likedSongs.includes(song.id)) {
        playerHeartBtn.classList.add('liked');
        playerHeartBtn.querySelector('i').className = "fa-solid fa-heart";
    } else {
        playerHeartBtn.classList.remove('liked');
        playerHeartBtn.querySelector('i').className = "fa-regular fa-heart";
    }

    // Refresh row highlighting
    highlightActiveRow();
    
    // Update visualizer details
    updateVisualizerOverlay();

    if (shouldPlay) {
        playAudio();
    }
}

function playAudio() {
    initAudioContext();
    audio.play().then(() => {
        isPlaying = true;
        btnPlayPause.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
        btnPlayPause.title = "Pause";
        highlightActiveRow();
    }).catch(err => {
        console.error("Playback failed: ", err);
    });
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    btnPlayPause.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    btnPlayPause.title = "Play";
    highlightActiveRow();
}

function togglePlay() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function nextTrack() {
    let nextIndex = currentSongIndex + 1;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * songsList.length);
    } else if (nextIndex >= songsList.length) {
        nextIndex = 0;
    }
    loadSong(nextIndex, isPlaying);
}

function prevTrack() {
    let prevIndex = currentSongIndex - 1;
    if (isShuffle) {
        prevIndex = Math.floor(Math.random() * songsList.length);
    } else if (prevIndex < 0) {
        prevIndex = songsList.length - 1;
    }
    loadSong(prevIndex, isPlaying);
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active-control', isShuffle);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active-control', isRepeat);
}

// VOLUME CONTROLS
function adjustVolume(val) {
    audio.volume = val / 100;
    volumeRange.value = val;
    volumeFill.style.width = `${val}%`;
    
    // Update icon
    const volumeIcon = btnVolumeIcon.querySelector('i');
    if (val == 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (val < 30) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else if (val < 70) {
        volumeIcon.className = "fa-solid fa-volume-medium";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
}

// MUTE/UNMUTE TOGGLE
let previousVolume = 70;
btnVolumeIcon.addEventListener('click', () => {
    if (audio.volume > 0) {
        previousVolume = volumeRange.value;
        adjustVolume(0);
    } else {
        adjustVolume(previousVolume);
    }
});

// TIMELINE SEEKING
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        playerProgressRange.value = progressPercent;
        playerProgressFill.style.width = `${progressPercent}%`;
        
        timeCurrent.textContent = formatTime(audio.currentTime);
        timeTotal.textContent = formatTime(audio.duration);
    }
});

// Format duration
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

playerProgressRange.addEventListener('input', () => {
    const time = (playerProgressRange.value / 100) * audio.duration;
    playerProgressFill.style.width = `${playerProgressRange.value}%`;
    timeCurrent.textContent = formatTime(time);
});

playerProgressRange.addEventListener('change', () => {
    audio.currentTime = (playerProgressRange.value / 100) * audio.duration;
    if (isPlaying) playAudio();
});

volumeRange.addEventListener('input', () => {
    adjustVolume(volumeRange.value);
});

// AUTO PLAY NEXT TRACK ON END
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playAudio();
    } else {
        nextTrack();
    }
});

// WEB AUDIO API VISUALIZER INITIALIZATION
function initAudioContext() {
    if (isVisualizerInitialized) return;
    
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        
        // Wire element
        sourceNode = audioCtx.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        isVisualizerInitialized = true;
        requestAnimationFrame(drawVisualizers);
    } catch (e) {
        console.warn("AudioContext failed (potentially due to CORS or browser blocks). Running fallback visualizer animation.", e);
        isCorsBlocked = true;
        isVisualizerInitialized = true;
        requestAnimationFrame(drawVisualizers);
    }
}

// AUDIO RENDER LOOP (MINI & EXPANDED CANVAS)
function drawVisualizers() {
    requestAnimationFrame(drawVisualizers);
    
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);
    
    if (analyser && isPlaying && !isCorsBlocked) {
        try {
            analyser.getByteFrequencyData(dataArray);
        } catch (e) {
            isCorsBlocked = true;
        }
    } else if (isPlaying) {
        // Generate simulated dynamic values when playing without AudioContext (CORS/Block fallback)
        const time = Date.now() * 0.004;
        for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = Math.max(0, Math.sin(i * 0.2 + time) * 70 + Math.cos(i * 0.05 - time * 0.7) * 40 + 100);
        }
    } else {
        // Idle flat values
        dataArray.fill(0);
    }

    drawMiniVisualizer(dataArray, bufferLength);
    drawExpandedVisualizer(dataArray, bufferLength);
}

// MINI SIDEBAR CANVAS VISUALIZER
function drawMiniVisualizer(dataArray, bufferLength) {
    const ctx = miniCanvas.getContext('2d');
    const width = miniCanvas.width;
    const height = miniCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw fine glowing rows of bars
    const barWidth = (width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        // Scale frequency value
        const val = dataArray[i] / 255;
        barHeight = val * height * 0.85;
        
        // Colors: green to aqua gradient
        const red = 29;
        const green = Math.floor(185 + (val * 70));
        const blue = Math.floor(84 + (val * 170));
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        
        ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);
        x += barWidth;
        
        if (x >= width) break;
    }
}

// EXPANDED MAIN IMMERSIVE CANVAS VISUALIZER
function drawExpandedVisualizer(dataArray, bufferLength) {
    const ctx = expandedCanvas.getContext('2d');
    const width = expandedCanvas.width;
    const height = expandedCanvas.height;
    
    ctx.clearRect(0, 0, width, height);

    if (visualizerTheme === 'neon') {
        // Theme 1: Neon Equalizer Bars
        const barWidth = (width / bufferLength) * 1.2;
        let x = 0;
        
        // Background soft gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0a0a0a');
        bgGrad.addColorStop(1, '#151515');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i] / 255;
            const barHeight = val * height * 0.7;
            
            // Neon Green to Cyberpunk Pink gradient
            const grad = ctx.createLinearGradient(x, height - barHeight, x, height);
            grad.addColorStop(0, '#1ed760');
            grad.addColorStop(0.5, '#450af5');
            grad.addColorStop(1, '#e1306c');
            
            ctx.shadowBlur = isPlaying ? 15 : 0;
            ctx.shadowColor = '#1ed760';
            
            ctx.fillStyle = grad;
            ctx.fillRect(x, height - barHeight, barWidth - 3, barHeight);
            
            x += barWidth;
            if (x >= width) break;
        }
        ctx.shadowBlur = 0;
        
    } else if (visualizerTheme === 'wave') {
        // Theme 2: Smooth wave
        ctx.fillStyle = '#080808';
        ctx.fillRect(0, 0, width, height);
        
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1db954';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#1db954';
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 255;
            const y = (v * height * 0.5) + (height / 4) + Math.sin(i * 0.3 + Date.now() * 0.003) * 20;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
    } else if (visualizerTheme === 'circular') {
        // Theme 3: Circular waveform around central axis
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.45;
        
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#450af5';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#1ed760';
        
        for (let i = 0; i < bufferLength; i++) {
            const angle = (i / bufferLength) * Math.PI * 2;
            const val = dataArray[i] / 255;
            const radius = baseRadius + (val * 100);
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = '#121212';
        ctx.fill();
        ctx.strokeStyle = '#1ed760';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
    } else if (visualizerTheme === 'particles') {
        // Theme 4: Floating dynamic particle storm
        ctx.fillStyle = 'rgba(10, 10, 10, 0.3)'; // Trail effect
        ctx.fillRect(0, 0, width, height);
        
        if (particlesArray.length === 0) {
            // Seed particles
            for (let i = 0; i < 80; i++) {
                particlesArray.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 4 + 1,
                    speedX: Math.random() * 2 - 1,
                    speedY: Math.random() * 2 - 1,
                    color: i % 2 === 0 ? '#1ed760' : '#450af5'
                });
            }
        }
        
        // Use average energy to boost particles
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        const boost = (avg / 255) * 5;
        
        particlesArray.forEach(p => {
            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size + (boost * 1.5), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
            
            // Move
            p.x += p.speedX * (1 + boost);
            p.y += p.speedY * (1 + boost);
            
            // Check boundary collisions
            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
        });
        ctx.shadowBlur = 0;
    }
}

// UPDATE VISUALIZER METADATA CARD
function updateVisualizerOverlay() {
    const song = songsList[currentSongIndex];
    const vizAlbumArt = document.getElementById('viz-album-art');
    const vizTrackTitle = document.getElementById('viz-track-title');
    const vizTrackArtist = document.getElementById('viz-track-artist');
    
    if (vizAlbumArt && vizTrackTitle && vizTrackArtist) {
        vizAlbumArt.src = song.cover;
        vizTrackTitle.textContent = song.title;
        vizTrackArtist.textContent = song.artist;
    }
}

// SWITCH VISUALIZER THEMES
document.querySelectorAll('.visualizer-controls-row .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.visualizer-controls-row .btn').forEach(b => b.classList.remove('active-viz-theme'));
        e.target.classList.add('active-viz-theme');
        visualizerTheme = e.target.getAttribute('data-theme');
    });
});

// HIGHLIGHT ACTIVE TRACK IN LISTS
function highlightActiveRow() {
    // Check elements in home and liked views
    const rows = document.querySelectorAll('.tracklist-row');
    rows.forEach(row => {
        const id = row.getAttribute('data-song-id');
        const playIcon = row.querySelector('.col-num-val');
        
        if (id === songsList[currentSongIndex].id) {
            row.classList.add('active-row');
            if (playIcon) {
                if (isPlaying) {
                    playIcon.innerHTML = '<i class="fa-solid fa-volume-high" style="color: #1db954;"></i>';
                } else {
                    playIcon.innerHTML = '<i class="fa-solid fa-play" style="color: #1db954;"></i>';
                }
            }
        } else {
            row.classList.remove('active-row');
            if (playIcon) {
                const rowNum = row.getAttribute('data-row-num');
                playIcon.innerHTML = rowNum;
            }
        }
    });

    // Check recent grid elements
    document.querySelectorAll('.recent-card').forEach(card => {
        const id = card.getAttribute('data-song-id');
        const playBtn = card.querySelector('.play-hover-btn i');
        if (id === songsList[currentSongIndex].id) {
            card.style.borderColor = "var(--spotify-green)";
            if (playBtn) {
                playBtn.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
            }
        } else {
            card.style.borderColor = "transparent";
            if (playBtn) {
                playBtn.className = "fa-solid fa-play";
            }
        }
    });
}

// RENDER VIEWS: HOME VIEW
function renderHomeView() {
    recentGrid.innerHTML = '';
    cardsGrid.innerHTML = '';
    homeTracklistRows.innerHTML = '';
    
    // 1. Render recent tracks grid (6 items, repeat lists for layout fill)
    const recentSongs = [...songsList, songsList[0]]; // 6 items
    recentSongs.forEach((song, idx) => {
        const card = document.createElement('div');
        card.className = 'recent-card';
        card.setAttribute('data-song-id', song.id);
        card.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="recent-card-img">
            <span class="recent-card-info">${song.title}</span>
            <button class="play-hover-btn" title="Play">
                <i class="fa-solid fa-play"></i>
            </button>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.play-hover-btn')) {
                e.stopPropagation();
                if (currentSongIndex === idx % songsList.length) {
                    togglePlay();
                } else {
                    loadSong(idx % songsList.length, true);
                }
            } else {
                loadSong(idx % songsList.length, true);
            }
        });
        recentGrid.appendChild(card);
    });

    // 2. Render Made For You cards
    songsList.forEach((song, idx) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-card-img-box">
                <img src="${song.cover}" alt="${song.title}" class="song-card-img">
                <button class="play-hover-btn" title="Play">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>
            <div class="song-card-details">
                <span class="song-card-title">${song.title}</span>
                <span class="song-card-artist">${song.artist}</span>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.play-hover-btn')) {
                e.stopPropagation();
                if (currentSongIndex === idx) {
                    togglePlay();
                } else {
                    loadSong(idx, true);
                }
            } else {
                loadSong(idx, true);
            }
        });
        cardsGrid.appendChild(card);
    });

    // 3. Render Tracklist rows
    songsList.forEach((song, idx) => {
        const row = document.createElement('div');
        row.className = 'tracklist-row';
        row.setAttribute('data-song-id', song.id);
        row.setAttribute('data-row-num', idx + 1);
        
        const isLiked = likedSongs.includes(song.id);
        const heartClass = isLiked ? 'fa-solid fa-heart liked' : 'fa-regular fa-heart';
        
        row.innerHTML = `
            <div class="col-num col-num-val">${idx + 1}</div>
            <div class="col-title col-title-val">
                <img src="${song.cover}" alt="${song.title}" class="row-track-img">
                <div class="track-name-artist">
                    <span class="track-title">${song.title}</span>
                    <span class="track-artist">${song.artist}</span>
                </div>
            </div>
            <div class="col-album col-album-val">${song.album}</div>
            <div class="col-date col-date-val">${song.releaseDate}</div>
            <div class="col-like col-like-val">
                <button class="row-heart-btn ${isLiked ? 'liked' : ''}" title="Add to Liked Songs">
                    <i class="${heartClass}"></i>
                </button>
            </div>
            <div class="col-duration col-duration-val">${song.duration}</div>
        `;
        
        // Single click plays
        row.addEventListener('click', (e) => {
            if (e.target.closest('.row-heart-btn')) {
                e.stopPropagation();
                toggleLikeTrack(song.id);
            } else {
                loadSong(idx, true);
            }
        });
        
        homeTracklistRows.appendChild(row);
    });
}

// LIKED SONGS CONTROLS & RENDERING
function toggleLikeTrack(songId) {
    const idx = likedSongs.indexOf(songId);
    if (idx > -1) {
        likedSongs.splice(idx, 1);
    } else {
        likedSongs.push(songId);
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    
    updateLikedSongsDisplay();
    renderHomeView(); // Refresh buttons
    renderLikedSongsList(); // Refresh list inside liked view
    
    // Sync current song playbar heart
    if (songsList[currentSongIndex].id === songId) {
        if (likedSongs.includes(songId)) {
            playerHeartBtn.classList.add('liked');
            playerHeartBtn.querySelector('i').className = "fa-solid fa-heart";
        } else {
            playerHeartBtn.classList.remove('liked');
            playerHeartBtn.querySelector('i').className = "fa-regular fa-heart";
        }
    }
}

function updateLikedSongsDisplay() {
    const count = likedSongs.length;
    likedSongsCountText.textContent = count;
    likedHeroCountText.textContent = `${count} song${count !== 1 ? 's' : ''}`;
}

function renderLikedSongsList() {
    likedTracklistRows.innerHTML = '';
    
    if (likedSongs.length === 0) {
        likedTracklistRows.innerHTML = `
            <div class="no-songs-placeholder">
                <i class="fa-regular fa-heart"></i>
                <h3>Songs you like will appear here</h3>
                <p>Save songs by clicking the heart icon.</p>
                <button class="btn btn-white" id="find-songs-btn-dynamic">Find songs</button>
            </div>
        `;
        document.getElementById('find-songs-btn-dynamic').addEventListener('click', () => switchView('home'));
        return;
    }
    
    likedSongs.forEach((songId, index) => {
        const songIdx = songsList.findIndex(s => s.id === songId);
        if (songIdx === -1) return;
        const song = songsList[songIdx];
        
        const row = document.createElement('div');
        row.className = 'tracklist-row';
        row.setAttribute('data-song-id', song.id);
        row.setAttribute('data-row-num', index + 1);
        
        row.innerHTML = `
            <div class="col-num col-num-val">${index + 1}</div>
            <div class="col-title col-title-val">
                <img src="${song.cover}" alt="${song.title}" class="row-track-img">
                <div class="track-name-artist">
                    <span class="track-title">${song.title}</span>
                    <span class="track-artist">${song.artist}</span>
                </div>
            </div>
            <div class="col-album col-album-val">${song.album}</div>
            <div class="col-date col-date-val">Recently</div>
            <div class="col-like col-like-val">
                <button class="row-heart-btn liked" title="Remove from Liked Songs">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
            <div class="col-duration col-duration-val">${song.duration}</div>
        `;
        
        row.addEventListener('click', (e) => {
            if (e.target.closest('.row-heart-btn')) {
                e.stopPropagation();
                toggleLikeTrack(song.id);
            } else {
                loadSong(songIdx, true);
            }
        });
        
        likedTracklistRows.appendChild(row);
    });
}

// LIKED PLAYLIST CONTROL
playLikedPlaylistBtn.addEventListener('click', () => {
    if (likedSongs.length > 0) {
        const firstLikedId = likedSongs[0];
        const songIdx = songsList.findIndex(s => s.id === firstLikedId);
        if (songIdx > -1) {
            loadSong(songIdx, true);
        }
    }
});

// SEARCH LOGIC
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        searchInitialContent.classList.remove('hidden');
        searchResultsContent.classList.add('hidden');
        clearSearchBtn.classList.add('hidden');
        return;
    }
    
    clearSearchBtn.classList.remove('hidden');
    searchInitialContent.classList.add('hidden');
    searchResultsContent.classList.remove('hidden');
    
    // Filter
    const filteredSongs = songsList.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    );
    
    renderSearchResults(filteredSongs, query);
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInitialContent.classList.remove('hidden');
    searchResultsContent.classList.add('hidden');
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
});

function renderSearchResults(results, query) {
    topSearchResult.innerHTML = '';
    searchSongsResults.innerHTML = '';
    
    if (results.length === 0) {
        topSearchResult.innerHTML = `
            <div class="top-result-details">
                <span class="top-result-badge">No Results</span>
                <h3 class="top-result-name">No matches for "${query}"</h3>
                <p style="color: var(--text-muted); font-size:14px; margin-top:8px">Please check spelling or search for another term.</p>
            </div>
        `;
        return;
    }
    
    // 1. Render Top Result (first match)
    const topSong = results[0];
    const topSongIndex = songsList.findIndex(s => s.id === topSong.id);
    
    topSearchResult.innerHTML = `
        <img src="${topSong.cover}" alt="${topSong.title}" class="top-result-card-img">
        <span class="top-result-name">${topSong.title}</span>
        <div>
            <span class="top-result-badge">Song</span>
            <span style="color: var(--text-muted); font-size:14px; margin-left:8px">• ${topSong.artist}</span>
        </div>
        <button class="play-hover-btn" title="Play">
            <i class="fa-solid fa-play"></i>
        </button>
    `;
    
    topSearchResult.addEventListener('click', (e) => {
        if (e.target.closest('.play-hover-btn')) {
            e.stopPropagation();
            if (currentSongIndex === topSongIndex) {
                togglePlay();
            } else {
                loadSong(topSongIndex, true);
            }
        } else {
            loadSong(topSongIndex, true);
        }
    });

    // 2. Render Songs list (all matches)
    results.forEach(song => {
        const songIdx = songsList.findIndex(s => s.id === song.id);
        const row = document.createElement('div');
        row.className = 'search-result-row';
        row.innerHTML = `
            <div class="search-result-row-left">
                <img src="${song.cover}" alt="${song.title}" class="search-result-row-img">
                <div class="track-name-artist">
                    <span class="track-title">${song.title}</span>
                    <span class="track-artist">${song.artist}</span>
                </div>
            </div>
            <span style="font-size: 13px; color: var(--text-muted);">${song.duration}</span>
        `;
        row.addEventListener('click', () => {
            loadSong(songIdx, true);
        });
        searchSongsResults.appendChild(row);
    });
}

// SETUP INTERACTIVE EVENT LISTENERS
function setupEventListeners() {
    // Play/Pause button
    btnPlayPause.addEventListener('click', togglePlay);
    
    // Skip buttons
    btnNext.addEventListener('click', nextTrack);
    btnPrev.addEventListener('click', prevTrack);
    
    // Shuffle/Repeat
    btnShuffle.addEventListener('click', toggleShuffle);
    btnRepeat.addEventListener('click', toggleRepeat);
    
    // Playbar heart action
    playerHeartBtn.addEventListener('click', () => {
        toggleLikeTrack(songsList[currentSongIndex].id);
    });

    // Keyboard Shortcuts (Space bar plays/pauses)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement !== searchInput) {
            e.preventDefault();
            togglePlay();
        }
    });
    
    // Profile Dropdown Toggle
    profileDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        profileMenu.classList.remove('show');
    });

    // Theme Toggle
    btnThemeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', targetTheme);
        
        btnThemeToggle.innerHTML = targetTheme === 'dark' ? 
            '<i class="fa-solid fa-circle-half-stroke"></i> Toggle Theme' : 
            '<i class="fa-solid fa-moon"></i> Toggle Theme';
    });

    // Toggle Visualizer view
    btnToggleVisualizer.addEventListener('click', () => {
        const isVisualizerActive = !viewVisualizer.classList.contains('hidden');
        if (isVisualizerActive) {
            switchView('home');
        } else {
            switchView('visualizer');
        }
    });

    // Fullscreen Toggle
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                btnFullscreen.innerHTML = '<i class="fa-solid fa-compress"></i>';
            }).catch(err => {
                console.error("Fullscreen error: ", err);
            });
        } else {
            document.exitFullscreen().then(() => {
                btnFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
            });
        }
    });

    // Create custom playlist click
    createPlaylistBtn.addEventListener('click', () => {
        const playlistName = prompt("Enter playlist name:", `My Playlist #${customPlaylists.length + 1}`);
        if (playlistName && playlistName.trim() !== '') {
            const newPlaylist = {
                id: `playlist-${Date.now()}`,
                name: playlistName.trim(),
                songIds: []
            };
            customPlaylists.push(newPlaylist);
            localStorage.setItem('customPlaylists', JSON.stringify(customPlaylists));
            renderPlaylists();
        }
    });

    if (findSongsBtn) {
        findSongsBtn.addEventListener('click', () => switchView('home'));
    }
}

// RENDER PLAYLISTS IN SIDEBAR
function renderPlaylists() {
    // Clear list but retain the default Liked Songs list item
    const likedItem = document.getElementById('playlist-liked');
    playlistsList.innerHTML = '';
    playlistsList.appendChild(likedItem);
    
    customPlaylists.forEach(playlist => {
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'playlist-item';
        item.innerHTML = `
            <div class="liked-icon-box" style="background: linear-gradient(135deg, #1db954, #191414)">
                <i class="fa-solid fa-music"></i>
            </div>
            <div class="playlist-info">
                <span class="playlist-name">${playlist.name}</span>
                <span class="playlist-meta">Playlist • ${playlist.songIds.length} songs</span>
            </div>
        `;
        
        // Add active styling or dynamic behaviors if needed
        item.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`"${playlist.name}" is an interactive project playlist placeholder! You can add songs here in production.`);
        });
        playlistsList.appendChild(item);
    });
}
