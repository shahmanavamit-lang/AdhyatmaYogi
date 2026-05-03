(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');
  const audioBtn = document.querySelector('.js-audio-toggle');
  /* ════════════════════════════════════════════════════
       MASTER AUDIO CONTROLLER (Bulletproof Sync)
    ════════════════════════════════════════════════════ */
  let bgAudio = new Audio('assets/music.mp3');
  bgAudio.loop = true;
  let isPlaying = false;

  // Smart Sync: Always grabs the exact button state so it never glitches
  function updateAudioUI(playing) {
    if (!audioBtn) return;
    const iOn = audioBtn.querySelector('.icon-sound-on');
    const iOff = audioBtn.querySelector('.icon-sound-off');

    if (iOn && iOff) {
      if (playing) {
        iOn.style.display = 'block'; // Shows Sound Waves (Music ON)
        iOff.style.display = 'none'; // Hides X
      } else {
        iOn.style.display = 'none';  // Hides Sound Waves
        iOff.style.display = 'block';// Shows X (Music OFF)
      }
    }
  }

  // The Play Function
  function startMusic() {
    if (!isPlaying) {
      bgAudio.volume = 0.30; // 30% Volume
      bgAudio.play().then(() => {
        isPlaying = true;
        updateAudioUI(true); // Forces the "ON" icon
      }).catch(err => {
        isPlaying = false;
        updateAudioUI(false); // Forces the "MUTE" icon if browser blocks auto-play
      });
    }
  }

  // 1. Guarantee UI starts correctly synced, then try to play
  updateAudioUI(false);
  startMusic();

  // 2. Play on first interaction if auto-play was blocked by the browser
  const initAudio = () => {
    startMusic();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('touchstart', initAudio);
    document.removeEventListener('scroll', initAudio);
  };

  // We wait for the user to click or scroll anywhere on the page
  document.addEventListener('click', initAudio);
  document.addEventListener('touchstart', initAudio);
  document.addEventListener('scroll', initAudio);

  // 3. Bulletproof Button Click Logic
  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Stops conflict with background clicks
      if (isPlaying) {
        bgAudio.pause();
        isPlaying = false;
      } else {
        bgAudio.volume = 0.30;
        bgAudio.play();
        isPlaying = true;
      }
      updateAudioUI(isPlaying); // Instantly snap to the correct icon
    });
  }

  /* ════════════════════════════════════════════════════
       SMOOTH SCROLL EFFECTS, NAVBAR, & CINEMATIC PULL-BACK
  ════════════════════════════════════════════════════ */
  function handleScroll() {
    if (window.isCinematicScrolling) return;

    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    if (nav) {
      nav.classList.toggle('solid', scrollY > 50);
    }

    // ── THE CINEMATIC PULL-BACK (Hero Section) ──
    const heroContainer = document.querySelector('.hero-container');
    const heroUniverse = document.querySelector('.hero-universe');

    const progress = scrollY / windowH;
    const cappedProgress = Math.min(progress, 1.5);

    if (heroContainer) {
      heroContainer.style.transform = `translate3d(0, ${cappedProgress * 150}px, 0) scale(${1 - (cappedProgress * 0.15)})`;
      heroContainer.style.opacity = Math.max(0, 1 - (cappedProgress * 1.5));
    }

    if (heroUniverse) {
      heroUniverse.style.opacity = Math.max(0, 1 - (cappedProgress * 1.0));
    }

    // ── THE SANGHA HORIZONTAL SCROLL (With "The Pause") ──
    // ── THE SANGHA HORIZONTAL SCROLL (With Full-Screen Pause) ──
    const sanghaSection = document.getElementById('s-sangha');
    const sanghaTrack = document.querySelector('.js-sangha-track');
    const sanghaCards = document.querySelectorAll('.sangha-card');

    if (sanghaSection && sanghaTrack && sanghaCards.length > 0) {

      const totalCards = sanghaCards.length;
      const maxTranslate = (totalCards - 1) * window.innerWidth;

      // CRITICAL FIX: Increased pause distance to 1.0 (100% of screen height).
      // The section will lock at the top, and stay perfectly still while you 
      // scroll a full screen downward. Only then will it slide sideways.
      const pauseDistance = window.innerHeight * 1.0;

      // Add the pause to the section's total height calculation
      sanghaSection.style.height = `${window.innerHeight + pauseDistance + maxTranslate}px`;

      const rect = sanghaSection.getBoundingClientRect();

      // -rect.top is exactly 0 the millisecond the section hits the top of the screen
      let scrollProgress = -rect.top;

      // Subtract the pause distance from the user's scroll
      let activeScroll = scrollProgress - pauseDistance;

      // 1. If we are still in the "Pause" zone, lock the track completely still
      if (activeScroll < 0) {
        sanghaTrack.style.transform = `translate3d(0, 0, 0)`;
      }
      // 2. Once the user has scrolled past the pause, slide it smoothly
      else if (activeScroll >= 0 && activeScroll <= maxTranslate) {
        let percentage = activeScroll / maxTranslate;
        sanghaTrack.style.transform = `translate3d(-${maxTranslate * percentage}px, 0, 0)`;
      }
      // 3. Lock it exactly at the end of the last Jharokha
      else if (activeScroll > maxTranslate) {
        sanghaTrack.style.transform = `translate3d(-${maxTranslate}px, 0, 0)`;
      }
    }
  }


  /* ════════════════════════════════════════════════════
     RAF SCROLL LOOP (Performance Optimized)
  ════════════════════════════════════════════════════ */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ════════════════════════════════════════════════════
     REVEAL ANIMATIONS (Intersection Observer) - REPEATING
  ════════════════════════════════════════════════════ */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Trigger the animation when it comes onto the screen
        e.target.classList.add('active');
      } else {
        // RESET the animation when it leaves the screen!
        e.target.classList.remove('active');
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  // Initial load for the hero section
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal').forEach(el => {
      el.classList.add('active');
      // Notice: We removed the 'unobserve' command from here too, 
      // so if you scroll back to the very top, the hero re-animates!
    });
  }, 100);
  /* ════════════════════════════════════════════════════
     CINEMATIC SLOW SCROLL (The Cinematic Pull-Back Click)
  ════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {

      if (window.isCinematicScrolling) {
        e.preventDefault();
        return;
      }

      const targetId = this.getAttribute('href');
      const t = document.querySelector(targetId);

      if (t) {
        e.preventDefault();

        const navHeight = nav ? nav.offsetHeight : 80;
        let targetPos = t.getBoundingClientRect().top + window.scrollY - navHeight;

        if (targetId !== '#hero') {
          targetPos += 40;
        }

        targetPos = Math.max(0, targetPos);

        const duration = 2000;
        const startPos = window.scrollY;
        const distance = targetPos - startPos;
        let startTime = null;

        document.documentElement.style.scrollBehavior = 'auto';
        document.body.classList.add('is-scrolling');

        window.isCinematicScrolling = true;

        const heroContainer = document.querySelector('.hero-container');
        const heroUniverse = document.querySelector('.hero-universe');
        const windowH = window.innerHeight;

        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;

          const easeInOutQuart = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t * t + b;
            t -= 2;
            return -c / 2 * (t * t * t * t - 2) + b;
          };

          const run = easeInOutQuart(timeElapsed, startPos, distance, duration);
          window.scrollTo(0, run);

          // ── THE CINEMATIC PULL-BACK (Synced with the click scroll) ──
          const progress = run / windowH;
          const cappedProgress = Math.min(progress, 1.5);

          if (heroContainer) {
            heroContainer.style.transform = `translate3d(0, ${cappedProgress * 150}px, 0) scale(${1 - (cappedProgress * 0.15)})`;
            heroContainer.style.opacity = Math.max(0, 1 - (cappedProgress * 1.5));
          }

          if (heroUniverse) {
            heroUniverse.style.opacity = Math.max(0, 1 - (cappedProgress * 1.0));
          }

          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          } else {
            window.scrollTo(0, targetPos);
            document.documentElement.style.scrollBehavior = '';
            document.body.classList.remove('is-scrolling');
            window.isCinematicScrolling = false;
          }
        }

        requestAnimationFrame(animation);
      }
    });
  });

  /* ════════════════════════════════════════════════════
     THE PEACEFUL FIBONACCI MEDITATION TREE
  ════════════════════════════════════════════════════ */
  const treeCanvas = document.getElementById('meditation-tree');
  if (treeCanvas) {
    const ctx = treeCanvas.getContext('2d');
    let time = 0;

    function resizeCanvas() {
      treeCanvas.width = treeCanvas.offsetWidth;
      treeCanvas.height = treeCanvas.offsetHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Refined Fractal Math for a Taller, Elegant Tree
    function drawBranch(startX, startY, len, angle, branchWidth) {
      ctx.beginPath();
      ctx.save();

      // Softer, non-glowing golden wire
      ctx.strokeStyle = "rgba(212, 163, 91, 0.25)";
      ctx.lineWidth = branchWidth;

      ctx.translate(startX, startY);
      ctx.rotate(angle * Math.PI / 180);

      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();

      // Stops earlier so the tree doesn't get messy
      if (len < 12) {
        ctx.restore();
        return;
      }

      // THE PEACEFUL WIND: Extremely slow, soft sway
      let sway = Math.sin(time + len * 0.02) * 0.8;

      // NARROWER ANGLE (22) keeps the tree looking tall and spiritual
      drawBranch(0, -len, len * 0.78, angle + 22 + sway, branchWidth * 0.7);
      drawBranch(0, -len, len * 0.78, angle - 22 + sway, branchWidth * 0.7);

      ctx.restore();
    }

    function animateTree() {
      ctx.clearRect(0, 0, treeCanvas.width, treeCanvas.height);

      // Starts slightly lower on the screen
      let trunkHeight = treeCanvas.height * 0.25;

      drawBranch(treeCanvas.width / 2, treeCanvas.height + 20, trunkHeight, 0, 3);

      // Time moves incredibly slowly for meditation
      time += 0.003;

      requestAnimationFrame(animateTree);
    }

    animateTree();
  }
  /* ════════════════════════════════════════════════════
       SANGHA 3D MERRY-GO-ROUND SCROLL LOGIC (OPTIMIZED)
  ════════════════════════════════════════════════════ */
  let isSanghaTicking = false;
  window.addEventListener('scroll', () => {
    if (!isSanghaTicking) {
      window.requestAnimationFrame(() => {
        const sanghaSection = document.getElementById("s-sangha");
        const carousel = document.getElementById("sa-carousel");

        if (sanghaSection && carousel) {
          const rect = sanghaSection.getBoundingClientRect();
          const scrollDistance = rect.height - window.innerHeight;
          const scrolledIn = -rect.top;

          // 1. Calculate raw progress (0 to 1)
          let rawProgress = scrolledIn / scrollDistance;
          rawProgress = Math.max(0, Math.min(1, rawProgress));

          // 2. Create Cinematic Deadzones (Pause -> Spin -> Pause)
          let spinProgress = 0;
          if (rawProgress > 0.1 && rawProgress < 0.9) {
            spinProgress = (rawProgress - 0.1) / 0.8;
          } else if (rawProgress >= 0.9) {
            spinProgress = 1;
          }

          // 3. Apply the rotation
          const yRotation = spinProgress * -360;
          carousel.style.transform = `rotateX(-5deg) rotateY(${yRotation}deg)`;
        }
        isSanghaTicking = false;
      });
      isSanghaTicking = true;
    }
  }, { passive: true });
})();