/**
 * AUDIORA – Heritage Audio Guide Application Logic
 * SpeechSynthesis Audio Engine, Card Renderer, Search/Filter, Modal, and Quiz Engine
 */

// Application State
const AppState = {
  currentFilter: 'all',
  searchQuery: '',
  activeSite: null,
  currentPlayingId: null,
  speechUtterance: null,
  playbackSpeed: 1.0,
  selectedVoice: null,
  // Quiz State
  quizCurrentIndex: 0,
  quizScore: 0,
  quizAnswerSelected: false
};

// ==========================================================================
// 1. Audio Guide Engine (Web SpeechSynthesis API)
// ==========================================================================
class AudioGuideEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.isSupported = 'speechSynthesis' in window;
    this.initVoices();
  }

  initVoices() {
    if (!this.isSupported) {
      console.warn("SpeechSynthesis API is not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      // Look for preferred voices: Indian English, then British/Natural English
      const indianVoice = this.voices.find(v => v.lang === 'en-IN');
      const standardVoice = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default));
      AppState.selectedVoice = indianVoice || standardVoice || this.voices[0];
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  speak(siteId) {
    if (!this.isSupported) {
      showToast("Speech audio is not supported in this browser.", "fa-triangle-exclamation");
      return;
    }

    const site = HERITAGE_SITES.find(s => s.id === siteId);
    if (!site) return;

    // If already playing this site, stop it
    if (AppState.currentPlayingId === siteId && this.synth.speaking) {
      this.stop();
      return;
    }

    // Cancel any ongoing speech
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }

    AppState.activeSite = site;
    AppState.currentPlayingId = siteId;

    // Refresh voices if not yet cached
    if (!AppState.selectedVoice && this.voices.length === 0) {
      this.initVoices();
    }

    const utterance = new SpeechSynthesisUtterance(site.audioScript);
    utterance.rate = AppState.playbackSpeed;
    utterance.pitch = 1.0;
    
    if (AppState.selectedVoice) {
      utterance.voice = AppState.selectedVoice;
    }

    utterance.onstart = () => {
      if (AppState.speechUtterance === utterance) {
        updatePlaybackUI(true, site);
        showToast(`Now playing audio: ${site.name}`, "fa-volume-high");
      }
    };

    utterance.onend = () => {
      if (AppState.speechUtterance === utterance) {
        this.clearPlayingState();
      }
    };

    utterance.onerror = (e) => {
      if (AppState.speechUtterance === utterance) {
        // Ignore expected user cancellation
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.error("SpeechSynthesis error:", e);
          showToast("Audio playback encountered an issue.", "fa-circle-exclamation");
        }
        this.clearPlayingState();
      }
    };

    AppState.speechUtterance = utterance;

    // Brief timeout prevents browser speech queue freeze on cancel -> speak transition
    setTimeout(() => {
      if (AppState.speechUtterance === utterance && AppState.currentPlayingId === siteId) {
        this.synth.speak(utterance);
      }
    }, 40);
  }

  stop() {
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      this.synth.cancel();
    }
    AppState.speechUtterance = null;
    this.clearPlayingState();
  }

  clearPlayingState() {
    AppState.currentPlayingId = null;
    updatePlaybackUI(false, AppState.activeSite);
  }

  setSpeed(speed) {
    AppState.playbackSpeed = speed;
    if (AppState.currentPlayingId) {
      // Restart current track with new speed seamlessly
      const currentId = AppState.currentPlayingId;
      this.speak(currentId);
    }
  }
}

const audioGuide = new AudioGuideEngine();

// ==========================================================================
// 2. Playback UI Synchronization
// ==========================================================================
function updatePlaybackUI(isPlaying, site) {
  // 1. Update Heritage Cards
  document.querySelectorAll('.heritage-card').forEach(card => {
    const cardId = card.getAttribute('data-site-id');
    const playBtn = card.querySelector('.btn-audio-play i');
    
    if (isPlaying && cardId === site?.id) {
      card.classList.add('playing');
      if (playBtn) playBtn.className = 'fa-solid fa-pause';
    } else {
      card.classList.remove('playing');
      if (playBtn) playBtn.className = 'fa-solid fa-play';
    }
  });

  // 2. Update Showcase Audio Player
  const playerCard = document.getElementById('audioShowcaseCard');
  const masterPlayBtn = document.getElementById('btnMasterPlay');
  const playerSelect = document.getElementById('playerSiteSelect');
  const playerTitle = document.getElementById('playerMonumentTitle');
  const playerLoc = document.getElementById('playerMonumentSub');
  const transcriptText = document.getElementById('transcriptContent');

  if (site) {
    if (playerSelect && playerSelect.value !== site.id) {
      playerSelect.value = site.id;
    }
    if (playerTitle) playerTitle.textContent = site.name;
    if (playerLoc) playerLoc.textContent = `${site.location} • ${site.dynasty}`;
    if (transcriptText) transcriptText.innerHTML = `<p>${site.audioScript}</p>`;
  }

  if (isPlaying) {
    playerCard?.classList.add('is-playing');
    if (masterPlayBtn) {
      masterPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      masterPlayBtn.title = 'Pause / Stop Audio';
    }
  } else {
    playerCard?.classList.remove('is-playing');
    if (masterPlayBtn) {
      masterPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      masterPlayBtn.title = 'Play Audio Guide';
    }
  }

  // 3. Update Global Floating Audio Bar
  const globalBar = document.getElementById('globalAudioBar');
  const globalTitle = document.getElementById('globalAudioTitle');

  if (isPlaying && site) {
    if (globalTitle) globalTitle.textContent = site.name;
    globalBar?.classList.add('visible');
  } else {
    globalBar?.classList.remove('visible');
  }

  // 4. Update Modal Play Button if modal is active
  const modalPlayBtn = document.getElementById('modalAudioBtn');
  if (modalPlayBtn) {
    if (isPlaying && site && modalPlayBtn.getAttribute('data-site-id') === site.id) {
      modalPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Audio';
    } else {
      modalPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i> Listen to Audio Guide';
    }
  }

  // 5. Update Quick Playlist items
  document.querySelectorAll('.playlist-quick-item').forEach(item => {
    if (isPlaying && item.getAttribute('data-site-id') === site?.id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ==========================================================================
// 3. Heritage Cards Rendering & Filtering
// ==========================================================================
function renderHeritageCards() {
  const container = document.getElementById('heritageGrid');
  if (!container) return;

  const filtered = HERITAGE_SITES.filter(site => {
    const matchesCategory = (AppState.currentFilter === 'all') || 
      (site.category.toLowerCase() === AppState.currentFilter.toLowerCase());

    const q = AppState.searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      site.name.toLowerCase().includes(q) ||
      (site.nativeName && site.nativeName.toLowerCase().includes(q)) ||
      site.location.toLowerCase().includes(q) ||
      site.state.toLowerCase().includes(q) ||
      site.dynasty.toLowerCase().includes(q) ||
      site.builder.toLowerCase().includes(q) ||
      site.shortDesc.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const countBadge = document.getElementById('resultsCount');
  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${HERITAGE_SITES.length} heritage places`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results-msg">
        <i class="fa-solid fa-landmark-dome"></i>
        <h3>No Historical Sites Found</h3>
        <p>No monuments match your query "<strong>${escapeHtml(AppState.searchQuery)}</strong>". Try adjusting your search or category filter.</p>
        <button class="btn-secondary" style="margin-top: 1rem;" onclick="resetSearchAndFilter()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(site => {
    const isPlaying = (AppState.currentPlayingId === site.id);
    return `
      <article class="heritage-card ${isPlaying ? 'playing' : ''}" data-site-id="${site.id}">
        <div class="card-image-wrap">
          <img src="${site.image}" 
               alt="${site.name}" 
               class="card-image"
               loading="lazy"
               onerror="this.onerror=null;this.src='${site.imageFallback}';" />
          <span class="card-category-badge">${site.category}</span>
          <span class="card-playing-indicator">
            <span class="audio-wave"><span></span><span></span><span></span><span></span></span>
            Listening
          </span>
        </div>

        <div class="card-body">
          <div class="card-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${site.location}</span>
          </div>
          <h3 class="card-title">${site.name}</h3>
          <div class="card-native-name">${site.nativeName}</div>

          <div class="card-meta-tags">
            <span class="meta-tag"><i class="fa-solid fa-crown"></i> ${site.dynasty}</span>
            <span class="meta-tag"><i class="fa-solid fa-calendar-days"></i> ${site.builtYear}</span>
            <span class="meta-tag"><i class="fa-solid fa-award"></i> UNESCO</span>
          </div>

          <p class="card-description">${site.shortDesc}</p>

          <div class="card-audio-controls">
            <span class="audio-label">
              <i class="fa-solid fa-headphones"></i> Audio Guide
            </span>
            <div class="audio-btn-group">
              <button class="btn-audio-play" 
                      onclick="handleCardPlay('${site.id}')"
                      title="Play Audio Guide"
                      aria-label="Play Audio Guide for ${site.name}">
                <i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
              </button>
              <button class="btn-audio-stop" 
                      onclick="audioGuide.stop()"
                      title="Stop Audio"
                      aria-label="Stop Audio">
                <i class="fa-solid fa-stop"></i>
              </button>
            </div>
          </div>

          <div class="card-footer-actions">
            <button class="btn-read-more" 
                    onclick="openMonumentModal('${site.id}')"
                    aria-label="Read full history about ${site.name}">
              <span>Read Full History</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function handleCardPlay(siteId) {
  if (AppState.currentPlayingId === siteId) {
    audioGuide.stop();
  } else {
    audioGuide.speak(siteId);
  }
}

function resetSearchAndFilter() {
  AppState.searchQuery = '';
  AppState.currentFilter = 'all';
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.classList.remove('visible');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
  });

  renderHeritageCards();
}

// ==========================================================================
// 4. Modal Deep-Dive Window
// ==========================================================================
function openMonumentModal(siteId) {
  const site = HERITAGE_SITES.find(s => s.id === siteId);
  if (!site) return;

  const modalOverlay = document.getElementById('monumentModal');
  const modalHeroImg = document.getElementById('modalHeroImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSubtitle');
  const modalDynasty = document.getElementById('modalDynasty');
  const modalBuilder = document.getElementById('modalBuilder');
  const modalYear = document.getElementById('modalYear');
  const modalLocation = document.getElementById('modalLocation');
  const modalHistory = document.getElementById('modalHistoryBody');
  const modalHighlights = document.getElementById('modalHighlightsList');
  const modalAudioBtn = document.getElementById('modalAudioBtn');

  if (modalHeroImg) {
    modalHeroImg.src = site.image;
    modalHeroImg.alt = site.name;
    modalHeroImg.onerror = () => { modalHeroImg.src = site.imageFallback; };
  }

  if (modalTitle) modalTitle.textContent = site.name;
  if (modalSub) modalSub.textContent = `${site.nativeName} • ${site.unescoStatus}`;
  if (modalDynasty) modalDynasty.textContent = site.dynasty;
  if (modalBuilder) modalBuilder.textContent = site.builder;
  if (modalYear) modalYear.textContent = site.builtYear;
  if (modalLocation) modalLocation.textContent = site.location;
  if (modalHistory) modalHistory.innerHTML = site.fullHistory;

  if (modalHighlights) {
    modalHighlights.innerHTML = site.highlights.map(item => `
      <li><i class="fa-solid fa-check-circle"></i><span>${item}</span></li>
    `).join('');
  }

  if (modalAudioBtn) {
    modalAudioBtn.setAttribute('data-site-id', site.id);
    const isPlaying = (AppState.currentPlayingId === site.id);
    modalAudioBtn.innerHTML = isPlaying 
      ? '<i class="fa-solid fa-pause"></i> Pause Audio' 
      : '<i class="fa-solid fa-play"></i> Listen to Audio Guide';
  }

  modalOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMonumentModal() {
  const modalOverlay = document.getElementById('monumentModal');
  modalOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================================================
// 5. Dedicated Audio Guide Showcase Lounge
// ==========================================================================
function initAudioShowcase() {
  const select = document.getElementById('playerSiteSelect');
  const playlistGrid = document.getElementById('quickPlaylistGrid');
  
  if (select) {
    select.innerHTML = HERITAGE_SITES.map(s => `
      <option value="${s.id}">${s.name} (${s.location})</option>
    `).join('');

    select.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const site = HERITAGE_SITES.find(s => s.id === selectedId);
      if (site) {
        updatePlaybackUI(AppState.currentPlayingId === selectedId, site);
      }
    });
  }

  if (playlistGrid) {
    playlistGrid.innerHTML = HERITAGE_SITES.map(s => `
      <div class="playlist-quick-item" data-site-id="${s.id}" onclick="selectAndPlay('${s.id}')">
        <img src="${s.image}" alt="${s.name}" onerror="this.onerror=null;this.src='${s.imageFallback}';" />
        <div>
          <div class="playlist-quick-title">${s.name}</div>
          <div class="playlist-quick-loc">${s.location}</div>
        </div>
      </div>
    `).join('');
  }

  // Set default initial showcase site
  if (HERITAGE_SITES.length > 0) {
    updatePlaybackUI(false, HERITAGE_SITES[0]);
  }
}

function selectAndPlay(siteId) {
  const select = document.getElementById('playerSiteSelect');
  if (select) select.value = siteId;
  audioGuide.speak(siteId);
}

// ==========================================================================
// 6. Interactive History Quiz Engine
// ==========================================================================
function renderQuizQuestion() {
  const q = HERITAGE_QUIZ[AppState.quizCurrentIndex];
  if (!q) {
    renderQuizResults();
    return;
  }

  AppState.quizAnswerSelected = false;

  // View toggle
  document.getElementById('quizActiveView')?.classList.remove('hidden');
  document.getElementById('quizResultView')?.classList.remove('visible');

  // Question metadata
  const progressText = document.getElementById('quizProgressText');
  const scoreBadge = document.getElementById('quizScoreBadge');
  const progressFill = document.getElementById('quizProgressFill');
  const questionText = document.getElementById('quizQuestionText');
  const optionsContainer = document.getElementById('quizOptionsList');
  const explanationBox = document.getElementById('quizExplanationBox');
  const nextBtn = document.getElementById('btnNextQuestion');

  if (progressText) {
    progressText.textContent = `Question ${AppState.quizCurrentIndex + 1} of ${HERITAGE_QUIZ.length}`;
  }

  if (scoreBadge) {
    scoreBadge.textContent = `Score: ${AppState.quizScore} / ${HERITAGE_QUIZ.length}`;
  }

  if (progressFill) {
    const percent = ((AppState.quizCurrentIndex) / HERITAGE_QUIZ.length) * 100;
    progressFill.style.width = `${percent}%`;
  }

  if (questionText) {
    questionText.textContent = q.question;
  }

  if (explanationBox) {
    explanationBox.classList.remove('visible');
    explanationBox.innerHTML = '';
  }

  if (nextBtn) {
    nextBtn.style.display = 'none';
    nextBtn.textContent = (AppState.quizCurrentIndex === HERITAGE_QUIZ.length - 1) 
      ? 'View Final Results' 
      : 'Next Question';
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (optionsContainer) {
    optionsContainer.innerHTML = q.options.map((opt, idx) => `
      <button class="quiz-option-btn" 
              onclick="handleQuizAnswer(${idx})" 
              id="quizOpt${idx}">
        <span class="option-prefix">${optionLetters[idx]}</span>
        <span>${escapeHtml(opt)}</span>
      </button>
    `).join('');
  }
}

function handleQuizAnswer(selectedIndex) {
  if (AppState.quizAnswerSelected) return;
  AppState.quizAnswerSelected = true;

  const q = HERITAGE_QUIZ[AppState.quizCurrentIndex];
  const isCorrect = (selectedIndex === q.correctAnswer);

  if (isCorrect) {
    AppState.quizScore++;
  }

  // Update button classes
  q.options.forEach((_, idx) => {
    const btn = document.getElementById(`quizOpt${idx}`);
    if (!btn) return;
    btn.disabled = true;

    if (idx === q.correctAnswer) {
      btn.classList.add('selected-correct');
    } else if (idx === selectedIndex && !isCorrect) {
      btn.classList.add('selected-wrong');
    }
  });

  // Reveal Explanation
  const explanationBox = document.getElementById('quizExplanationBox');
  if (explanationBox) {
    explanationBox.innerHTML = `
      <div class="explanation-title">
        <i class="fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-info'}"></i>
        ${isCorrect ? 'Correct Answer!' : 'Historical Fact & Context:'}
      </div>
      <p class="explanation-text">${q.explanation}</p>
    `;
    explanationBox.classList.add('visible');
  }

  // Update Score badge
  const scoreBadge = document.getElementById('quizScoreBadge');
  if (scoreBadge) {
    scoreBadge.textContent = `Score: ${AppState.quizScore} / ${HERITAGE_QUIZ.length}`;
  }

  // Show Next Button
  const nextBtn = document.getElementById('btnNextQuestion');
  if (nextBtn) {
    nextBtn.style.display = 'inline-flex';
  }
}

function nextQuizQuestion() {
  AppState.quizCurrentIndex++;
  if (AppState.quizCurrentIndex < HERITAGE_QUIZ.length) {
    renderQuizQuestion();
  } else {
    renderQuizResults();
  }
}

function renderQuizResults() {
  const activeView = document.getElementById('quizActiveView');
  const resultView = document.getElementById('quizResultView');
  const scoreNum = document.getElementById('resultScoreNumber');
  const scoreFeedback = document.getElementById('resultFeedback');
  const progressFill = document.getElementById('quizProgressFill');

  activeView?.classList.add('hidden');
  resultView?.classList.add('visible');

  if (progressFill) progressFill.style.width = '100%';

  const total = HERITAGE_QUIZ.length;
  const score = AppState.quizScore;
  const percentage = Math.round((score / total) * 100);

  if (scoreNum) scoreNum.textContent = `${score}/${total}`;

  let feedback = "";
  if (percentage === 100) {
    feedback = "Outstanding! You are an honorary Heritage Master with exceptional knowledge of Indian historical architecture and history.";
  } else if (percentage >= 70) {
    feedback = "Splendid job! You possess a deep appreciation for India's rich cultural landmarks and imperial history.";
  } else if (percentage >= 40) {
    feedback = "Good effort! Take a quick audio tour of the heritage cards above and you'll be a history scholar in no time.";
  } else {
    feedback = "An exciting learning journey awaits! Listen to our spoken audio guides to discover the secrets behind each monument.";
  }

  if (scoreFeedback) scoreFeedback.textContent = feedback;
}

function restartQuiz() {
  AppState.quizCurrentIndex = 0;
  AppState.quizScore = 0;
  AppState.quizAnswerSelected = false;
  renderQuizQuestion();
}

// ==========================================================================
// 7. Toast & Helper Utilities
// ==========================================================================
let toastTimeout = null;

function showToast(message, iconClass = "fa-info-circle") {
  const toast = document.getElementById('appToast');
  if (!toast) return;

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${escapeHtml(message)}</span>`;
  toast.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ==========================================================================
// 8. Event Listeners & Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Renderings
  renderHeritageCards();
  initAudioShowcase();
  renderQuizQuestion();

  // 2. Search Input Listener
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');

  searchInput?.addEventListener('input', (e) => {
    AppState.searchQuery = e.target.value;
    searchClearBtn?.classList.toggle('visible', !!e.target.value);
    renderHeritageCards();
  });

  searchClearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    AppState.searchQuery = '';
    searchClearBtn.classList.remove('visible');
    renderHeritageCards();
    searchInput?.focus();
  });

  // 3. Category Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentFilter = btn.getAttribute('data-filter') || 'all';
      renderHeritageCards();
    });
  });

  // 4. Master Audio Showcase Controls
  const btnMasterPlay = document.getElementById('btnMasterPlay');
  const btnMasterStop = document.getElementById('btnMasterStop');
  const playerSelect = document.getElementById('playerSiteSelect');

  btnMasterPlay?.addEventListener('click', () => {
    const selectedId = playerSelect ? playerSelect.value : HERITAGE_SITES[0].id;
    if (AppState.currentPlayingId === selectedId) {
      audioGuide.stop();
    } else {
      audioGuide.speak(selectedId);
    }
  });

  btnMasterStop?.addEventListener('click', () => {
    audioGuide.stop();
  });

  // Global bar stop button
  document.getElementById('globalAudioStopBtn')?.addEventListener('click', () => {
    audioGuide.stop();
  });

  // Speed Buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
      audioGuide.setSpeed(speed);
      showToast(`Audio narration speed set to ${speed}x`, "fa-gauge-high");
    });
  });

  // Modal Audio Button
  document.getElementById('modalAudioBtn')?.addEventListener('click', function() {
    const siteId = this.getAttribute('data-site-id');
    if (siteId) {
      handleCardPlay(siteId);
    }
  });

  // Modal Close Events
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeMonumentModal);
  document.getElementById('monumentModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'monumentModal') {
      closeMonumentModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMonumentModal();
    }
  });

  // 5. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');

  mobileToggle?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.toggle('mobile-open');
    mobileToggle.innerHTML = isOpen 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Close mobile nav on link click & switch active state
  const navLinkElements = document.querySelectorAll('.nav-link');
  const pageSections = document.querySelectorAll('section[id]');

  navLinkElements.forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('mobile-open');
      if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      navLinkElements.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Header shadow & ScrollSpy for active navigation
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header-nav');
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentSection = '';
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

    pageSections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    if (currentSection) {
      navLinkElements.forEach(link => {
        const targetHash = link.getAttribute('href');
        if (targetHash === `#${currentSection}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // 6. Quiz Next & Restart Buttons
  document.getElementById('btnNextQuestion')?.addEventListener('click', nextQuizQuestion);
  document.getElementById('btnRestartQuiz')?.addEventListener('click', restartQuiz);

  // Stop speech if page is being closed / navigated away
  window.addEventListener('beforeunload', () => {
    audioGuide.stop();
  });
});

