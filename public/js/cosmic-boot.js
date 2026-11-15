    // Boot curtain guard. Registered before any canvas/3D asset loads, so the overlay
    // cannot outlive a failed THREE.js/WebGL initialisation. 3.5s is the hard cap.
    (function () {
      var curtain = document.getElementById('studio-boot-curtain');
      if (!curtain) return;
      var bar = document.getElementById('boot-laser-bar');
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var dismissed = false;

      function restoreScrolling() {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove('lenis-stopped');
        document.documentElement.classList.remove('lenis-stopped');
      }

      function dismiss() {
        if (dismissed) return;
        dismissed = true;
        restoreScrolling();
        curtain.style.pointerEvents = 'none';
        curtain.classList.add('is-hidden');
        curtain.style.opacity = '0';
        curtain.style.visibility = 'hidden';
        window.setTimeout(function () {
          if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
        }, 750);
      }

      if (bar) window.requestAnimationFrame(function () { bar.style.height = '100%'; });
      window.setTimeout(dismiss, prefersReduced ? 0 : 650);
      // Guaranteed fallback: dismiss even if assets, shaders or WebGL fail.
      window.setTimeout(dismiss, 3500);
      window.addEventListener('error', dismiss);
      window.addEventListener('unhandledrejection', dismiss);
      window.__prxDismissBootCurtain = dismiss;
    })();
