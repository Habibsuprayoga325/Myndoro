/* ========================================================
   SWEET EIGHTEEN DIGITAL LOVE LETTER - JAVASCRIPT LOGIC
   Ndoro Putriku & Bibib ♡ 19 Oktober
   ======================================================== */

// IIFE to isolate scope
(function() {
  'use strict';

  /* ======================================================
     1. SOUND EFFECTS (Web Audio API Synthesizer)
     ====================================================== */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function resumeAudioContext() {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft romantic pop/click
  function sfxPop(freq = 520) {
    try {
      resumeAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio SFX error:', e);
    }
  }

  // Dreamy celestial chime
  function sfxChime() {
    try {
      resumeAudioContext();
      const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98]; // D major pentatonic
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = audioCtx.currentTime + (idx * 0.06);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.8);
      });
    } catch (e) {
      console.warn('Chime SFX error:', e);
    }
  }

  // Celebratory fanfare
  function sfxFanfare() {
    try {
      resumeAudioContext();
      const chords = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.50, t: 0.35 }
      ];
      chords.forEach(c => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = c.f;

        const start = audioCtx.currentTime + c.t;
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.9);
      });
    } catch (e) {
      console.warn('Fanfare SFX error:', e);
    }
  }

  /* ======================================================
     2. CONTINUOUS BACKGROUND VIDEO PLAYLIST SYSTEM
     Seamless crossfade looping between videos:
     - aset/VID-20260825-WA0032.mp4
     - aset/VID20260823171738.mp4
     ====================================================== */
  const videoPlaylist = [
    './aset/VID-20260825-WA0032.mp4',
    './aset/VID20260823171738.mp4'
  ];

  let currentVideoIndex = 0;
  const bgVideo1 = document.getElementById('bgVideo1');
  const bgVideo2 = document.getElementById('bgVideo2');
  let activeVideoEl = bgVideo1;
  let nextVideoEl = bgVideo2;
  let isTransitioning = false;

  function initVideoBackground() {
    bgVideo1.src = videoPlaylist[0];
    bgVideo2.src = videoPlaylist[1];

    bgVideo1.muted = true;
    bgVideo2.muted = true;
    bgVideo1.playsInline = true;
    bgVideo2.playsInline = true;

    // Start video 1
    const playPromise = bgVideo1.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy might wait for user click
        const resumeVideoOnUserAction = () => {
          activeVideoEl.play();
          window.removeEventListener('click', resumeVideoOnUserAction);
          window.removeEventListener('touchstart', resumeVideoOnUserAction);
        };
        window.addEventListener('click', resumeVideoOnUserAction, { once: true });
        window.addEventListener('touchstart', resumeVideoOnUserAction, { once: true });
      });
    }

    // Attach transition handlers on both videos
    attachVideoListeners(bgVideo1);
    attachVideoListeners(bgVideo2);
  }

  function attachVideoListeners(videoEl) {
    // When video ends, switch to next video immediately
    videoEl.addEventListener('ended', handleVideoEnded);

    // If near end (last 0.8s), begin crossfading so it's completely seamless
    videoEl.addEventListener('timeupdate', () => {
      if (videoEl === activeVideoEl && !isTransitioning && videoEl.duration > 2) {
        if (videoEl.currentTime >= videoEl.duration - 0.75) {
          handleVideoEnded();
        }
      }
    });

    // Error recovery: if video fails to load, advance to next
    videoEl.addEventListener('error', (err) => {
      console.warn('Video playback error, advancing to next:', err);
      setTimeout(handleVideoEnded, 1000);
    });
  }

  function handleVideoEnded() {
    if (isTransitioning) return;
    isTransitioning = true;

    const nextIndex = (currentVideoIndex + 1) % videoPlaylist.length;

    // Prepare next video element
    nextVideoEl.src = videoPlaylist[nextIndex];
    nextVideoEl.currentTime = 0;
    
    const playNext = nextVideoEl.play();
    if (playNext !== undefined) {
      playNext.then(() => {
        // Crossfade classes
        nextVideoEl.classList.remove('next');
        nextVideoEl.classList.add('active');

        activeVideoEl.classList.remove('active');
        activeVideoEl.classList.add('next');

        // Swap references
        const temp = activeVideoEl;
        activeVideoEl = nextVideoEl;
        nextVideoEl = temp;
        currentVideoIndex = nextIndex;

        setTimeout(() => {
          isTransitioning = false;
        }, 1200);
      }).catch(err => {
        console.warn('Next video play error:', err);
        isTransitioning = false;
      });
    }
  }



  /* ======================================================
     3. FLOATING MUSIC PLAYER (Weswey - Kesima, ID: UmBnFK0_Xbs)
     YouTube IFrame API Integration
     ====================================================== */
  let ytPlayer = null;
  let isMusicPlaying = false;
  let isMusicMuted = false;

  const vinylDisc = document.getElementById('vinylDisc');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const btnMute = document.getElementById('btnMute');
  const iconPlay = document.querySelector('.icon-play');
  const iconPause = document.querySelector('.icon-pause');
  const iconUnmuted = document.querySelector('.icon-unmuted');
  const iconMuted = document.querySelector('.icon-muted');
  const trackStatus = document.getElementById('trackStatus');

  // Load YouTube IFrame API asynchronously
  function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new window.YT.Player('ytPlayer', {
      height: '100',
      width: '100',
      videoId: 'UmBnFK0_Xbs', // Weswey - Kesima
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        loop: 1,
        playlist: 'UmBnFK0_Xbs',
        modestbranding: 1,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  function onPlayerReady(event) {
    console.log('YouTube Player is ready for Kesima');
  }

  function onPlayerStateChange(event) {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setMusicUIPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setMusicUIPlaying(false);
    }
  }

  function onPlayerError(e) {
    console.warn('YouTube Player error code:', e.data);
    trackStatus.textContent = 'Lagu: Weswey - Kesima ♡';
  }

  function setMusicUIPlaying(playing) {
    isMusicPlaying = playing;
    if (playing) {
      vinylDisc.classList.add('playing');
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      trackStatus.textContent = 'Sedang memutar untukmu 🎶';
    } else {
      vinylDisc.classList.remove('playing');
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      trackStatus.textContent = 'Musik dijeda';
    }
  }

  function startMusic() {
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(85);
        ytPlayer.playVideo();
        setMusicUIPlaying(true);
      } catch (e) {
        console.warn('Could not play YT video yet:', e);
      }
    }
  }

  function toggleMusic() {
    sfxPop(650);
    if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') return;

    if (isMusicPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }

  function toggleMute() {
    sfxPop(550);
    if (!ytPlayer || typeof ytPlayer.isMuted !== 'function') return;

    if (ytPlayer.isMuted()) {
      ytPlayer.unMute();
      isMusicMuted = false;
      iconUnmuted.style.display = 'block';
      iconMuted.style.display = 'none';
    } else {
      ytPlayer.mute();
      isMusicMuted = true;
      iconUnmuted.style.display = 'none';
      iconMuted.style.display = 'block';
    }
  }

  if (btnPlayPause) btnPlayPause.addEventListener('click', toggleMusic);
  if (btnMute) btnMute.addEventListener('click', toggleMute);

  /* ======================================================
     4. PARTICLES SYSTEM (Floating Hearts & Stardust Canvas)
     ====================================================== */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  const particles = [];
  const maxAmbientParticles = 35;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, isBurst = false) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : height + Math.random() * 50;
      this.isBurst = isBurst;

      if (isBurst) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2;
        this.gravity = 0.08;
        this.size = Math.random() * 14 + 10;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      } else {
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -(Math.random() * 0.8 + 0.5);
        this.size = Math.random() * 12 + 8;
        this.life = Math.random() * 0.8 + 0.2;
        this.decay = Math.random() * 0.003 + 0.002;
      }

      this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
      const colors = ['#ff708f', '#ff9bb2', '#f5c76c', '#ffffff', '#ffb6c1'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.rotation = Math.random() * Math.PI;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      if (this.isBurst) {
        this.vy += this.gravity;
        this.life -= this.decay;
      } else {
        this.life -= this.decay;
        if (this.life <= 0 || this.y < -30) {
          this.y = height + 20;
          this.x = Math.random() * width;
          this.life = 1;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.life);

      if (this.type === 'heart') {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, (this.size + topCurveHeight) / 1.5, 0, this.size);
        ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 1.5, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        // 4-point sparkle star
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(Math.cos((i * Math.PI) / 2) * this.size, Math.sin((i * Math.PI) / 2) * this.size);
          ctx.lineTo(Math.cos(((i + 0.5) * Math.PI) / 2) * (this.size * 0.3), Math.sin(((i + 0.5) * Math.PI) / 2) * (this.size * 0.3));
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Populate ambient particles
  for (let i = 0; i < maxAmbientParticles; i++) {
    particles.push(new Particle());
  }

  function spawnBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, true));
    }
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.isBurst && p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  // Screen click spawns cute mini-heart burst
  window.addEventListener('click', (e) => {
    // Only spawn if not clicking an interactive button to avoid clutter
    if (!e.target.closest('button') && !e.target.closest('.modal-content')) {
      spawnBurst(e.clientX, e.clientY, 8);
    }
  });

  /* ======================================================
     5. STAGE MANAGEMENT & FLOW
     Stage 1: Envelope & Wax Seal
     Stage 2: Interactive Gifts
     Stage 3: LOVE Puzzle
     Stage 4: Scrapbook Memories
     Stage 5: Main Love Letter
     ====================================================== */
  const stages = [
    document.getElementById('stage1'),
    document.getElementById('stage2'),
    document.getElementById('stage3'),
    document.getElementById('stage4'),
    document.getElementById('stage5')
  ];

  function switchStage(targetIndex) {
    resumeAudioContext();
    sfxChime();

    stages.forEach((s, idx) => {
      if (idx === targetIndex) {
        s.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        s.classList.remove('active');
      }
    });

    // Big confetti celebratory burst on stage transition
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.4, 35);
  }

  // --- STAGE 1: ENVELOPE OPENING ---
  const envelopeContainer = document.getElementById('envelopeContainer');
  const envelope = document.querySelector('.envelope');
  let isEnvelopeOpened = false;

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    resumeAudioContext();
    sfxChime();
    startMusic();

    envelope.classList.add('opened');

    // Confetti burst from envelope center
    const rect = envelope.getBoundingClientRect();
    spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);

    // After animation, navigate to Stage 2
    setTimeout(() => {
      switchStage(1); // Go to gifts
    }, 1500);
  }

  if (envelopeContainer) {
    envelopeContainer.addEventListener('click', openEnvelope);
    envelopeContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }

  // --- STAGE 2: 3 INTERACTIVE GIFTS ---
  const giftCards = document.querySelectorAll('.gift-card');
  const giftsProgressText = document.getElementById('giftsProgressText');
  const btnToPuzzle = document.getElementById('btnToPuzzle');
  let openedGiftsCount = 0;

  giftCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.opened === 'true') return;
      card.dataset.opened = 'true';
      card.classList.add('opened');
      openedGiftsCount++;

      sfxPop(700);
      sfxChime();

      // If it's the chest, animate lid
      if (card.id === 'giftTreasure') {
        const lid = document.getElementById('chestLidGroup');
        if (lid) lid.style.transform = 'rotate(-35deg)';
      }

      const rect = card.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

      giftsProgressText.textContent = `Buka ketiga hadiah di atas (${openedGiftsCount}/3)`;

      if (openedGiftsCount >= 3) {
        giftsProgressText.textContent = `Semua hadiah terbuka! ✨ Siap lanjut ke misi cinta?`;
        btnToPuzzle.disabled = false;
        btnToPuzzle.classList.add('btn-heart-pulse');
        sfxFanfare();
      }
    });
  });

  if (btnToPuzzle) {
    btnToPuzzle.addEventListener('click', () => {
      switchStage(2); // Go to puzzle
    });
  }

  // --- STAGE 3: "L - O - V - E" PUZZLE ---
  const puzzleSlots = document.querySelectorAll('.puzzle-slot');
  const puzzleTiles = document.querySelectorAll('.puzzle-tile');
  const btnResetPuzzle = document.getElementById('btnResetPuzzle');
  const puzzleHintText = document.getElementById('puzzleHintText');
  const puzzleSuccessBanner = document.getElementById('puzzleSuccessBanner');
  const btnToMemories = document.getElementById('btnToMemories');

  let currentSlotIndex = 0;
  const targetWord = ['L', 'O', 'V', 'E'];
  let currentFilledLetters = [];

  puzzleTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      if (currentSlotIndex >= 4) return;

      const letter = tile.dataset.letter;
      sfxPop(500 + currentSlotIndex * 120);

      const targetSlot = puzzleSlots[currentSlotIndex];
      const slotLetterSpan = targetSlot.querySelector('.slot-letter');
      slotLetterSpan.textContent = letter;
      targetSlot.classList.add('filled');

      tile.disabled = true;
      currentFilledLetters.push({ letter, tileId: tile.id });
      currentSlotIndex++;

      const rect = targetSlot.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);

      // Check if word is complete
      if (currentSlotIndex === 4) {
        validatePuzzle();
      }
    });
  });

  function validatePuzzle() {
    const spelled = currentFilledLetters.map(item => item.letter).join('');
    if (spelled === 'LOVE') {
      // SUCCESS!
      sfxFanfare();
      puzzleHintText.innerHTML = `<span style="color: #4cd137;">Kata LOVE sempurna! 🎉</span>`;
      puzzleSuccessBanner.style.display = 'block';
      spawnBurst(window.innerWidth / 2, window.innerHeight * 0.45, 60);
    } else {
      // MISSPELLED
      sfxPop(300);
      puzzleHintText.innerHTML = `<span style="color: #ff6b6b;">Susunanmu: "${spelled}". Coba tekan Ulangi Susunan ya sayang! ♡</span>`;
    }
  }

  function resetPuzzle() {
    sfxPop(400);
    currentSlotIndex = 0;
    currentFilledLetters = [];
    puzzleSlots.forEach(slot => {
      slot.classList.remove('filled');
      slot.querySelector('.slot-letter').textContent = '';
    });
    puzzleTiles.forEach(tile => {
      tile.disabled = false;
    });
    puzzleHintText.innerHTML = `Susun huruf: <strong>L - O - V - E</strong>`;
    puzzleSuccessBanner.style.display = 'none';
  }

  if (btnResetPuzzle) {
    btnResetPuzzle.addEventListener('click', resetPuzzle);
  }

  if (btnToMemories) {
    btnToMemories.addEventListener('click', () => {
      switchStage(3); // Go to polaroid memories
    });
  }

  // --- STAGE 4: POLAROID ZOOM MODAL ---
  // --- STAGE 4: POLAROID & VIDEO ZOOM MODAL ---
  const polaroidItems = document.querySelectorAll('.polaroid-item');
  const photoModal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImg');
  const modalVideo = document.getElementById('modalVideo');
  const modalCaption = document.getElementById('modalCaption');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnToLetter = document.getElementById('btnToLetter');

  polaroidItems.forEach(item => {
    item.addEventListener('click', () => {
      sfxPop(650);
      const imgSrc = item.dataset.img;
      const videoSrc = item.dataset.video;
      const caption = item.dataset.caption;

      if (videoSrc) {
        modalImg.style.display = 'none';
        modalVideo.style.display = 'block';
        modalVideo.src = videoSrc;
        modalVideo.currentTime = 0;
        modalVideo.play().catch(e => console.warn('Modal video play:', e));
      } else {
        if (modalVideo) {
          modalVideo.pause();
          modalVideo.style.display = 'none';
        }
        modalImg.style.display = 'block';
        modalImg.src = imgSrc;
      }

      modalCaption.textContent = caption;
      photoModal.classList.add('active');
      photoModal.setAttribute('aria-hidden', 'false');

      const rect = item.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
    });
  });

  function closeModal() {
    sfxPop(450);
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
    }
    photoModal.classList.remove('active');
    photoModal.setAttribute('aria-hidden', 'true');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (photoModal) {
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) closeModal();
    });
  }

  if (btnToLetter) {
    btnToLetter.addEventListener('click', () => {
      switchStage(4); // Go to main letter
    });
  }

  // --- STAGE 5: WHATSAPP DIRECT REPLY & RESTART ---
  const btnSendReply = document.getElementById('btnSendReply');
  const btnRestartFromLetter = document.getElementById('btnRestartFromLetter');
  const btnRestartJourney = document.getElementById('btnRestartJourney');

  if (btnSendReply) {
    btnSendReply.addEventListener('click', () => {
      sfxFanfare();
      spawnBurst(window.innerWidth / 2, window.innerHeight * 0.5, 45);

      const message = `Halo bibib sayanggg ♡ Makasih banyak yaa buat surat cinta Sweet Eighteen dan websitenya!! Lucu dan bikin terharu bangett, love you so much bibib cintaa!! ✨💖`;
      // Direct WhatsApp link to Bibib's phone number 087846073782 (ID code 62)
      const waUrl = `https://wa.me/6287846073782?text=${encodeURIComponent(message)}`;
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 400);
    });
  }

  function restartJourney() {
    sfxPop(500);
    isEnvelopeOpened = false;
    if (envelope) envelope.classList.remove('opened');
    
    // Reset gifts
    openedGiftsCount = 0;
    giftCards.forEach(c => {
      c.dataset.opened = 'false';
      c.classList.remove('opened');
    });
    if (giftsProgressText) giftsProgressText.textContent = `Buka ketiga hadiah di atas (0/3)`;
    if (btnToPuzzle) {
      btnToPuzzle.disabled = true;
      btnToPuzzle.classList.remove('btn-heart-pulse');
    }
    const lid = document.getElementById('chestLidGroup');
    if (lid) lid.style.transform = 'none';

    // Reset puzzle
    resetPuzzle();

    // Back to stage 1
    switchStage(0);
  }

  if (btnRestartFromLetter) btnRestartFromLetter.addEventListener('click', restartJourney);
  if (btnRestartJourney) btnRestartJourney.addEventListener('click', restartJourney);

  // Initialize on load
  window.addEventListener('DOMContentLoaded', () => {
    initVideoBackground();
    loadYouTubeAPI();
  });

})();
