    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // =========================================================================
    // 0. EXACT PRAMANIXLABS MONOGRAM SVG (WITH ROUNDED INNER CUTOUTS & LASER AXIS)
    // =========================================================================
    function createPramanixLogoSVG(size = 28, uid = 'default', standalone = false) {
      const wingGradId = `prx-wing-${uid}`;
      const axisGradId = `prx-axis-${uid}`;
      const glowFilterId = `prx-glow-${uid}`;
      const xmlnsAttr = standalone ? ' xmlns="http://www.w3.org/2000/svg"' : '';

      // Exact geometry matching F05EE68D-C8F5-4B80-8376-C59ED4EAB7C9.png:
      // Mirrored three-prong monoliths with inner rounded cutouts + full-height vertical cyan laser axis
      return `<svg${xmlnsAttr} class="prx-logo" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" role="img" aria-label="PramanixLabs Geometric Monogram">
        <defs>
          <linearGradient id="${wingGradId}" x1="12" y1="10" x2="88" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="60%" stop-color="#E2E8F0" />
            <stop offset="100%" stop-color="#94A3B8" />
          </linearGradient>
          <linearGradient id="${axisGradId}" x1="50" y1="2" x2="50" y2="98" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="50%" stop-color="#22D3EE" />
            <stop offset="100%" stop-color="#06B6D4" />
          </linearGradient>
          <filter id="${glowFilterId}" x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Left Wing: Mirrored 3-Prong Monolith with Smooth Rounded Inner Corners -->
        <path class="prx-wing-left"
          d="M12 10 H46 V90 H12 V76 H22 Q29 76 29 69 V62 Q29 56 22 56 H12 V44 H22 Q29 44 29 38 V31 Q29 24 22 24 H12 Z"
          fill="url(#${wingGradId})" />
        <!-- Right Wing: Forward 3-Prong Monolith with Smooth Rounded Inner Corners -->
        <path class="prx-wing-right"
          d="M88 10 H54 V90 H88 V76 H78 Q71 76 71 69 V62 Q71 56 78 56 H88 V44 H78 Q71 44 71 38 V31 Q71 24 78 24 H88 Z"
          fill="url(#${wingGradId})" />
        <!-- Central Vertical Blazing Cyan Laser Axis -->
        <rect class="prx-axis-line" x="48.4" y="3" width="3.2" height="94" rx="1.6"
          fill="url(#${axisGradId})" filter="url(#${glowFilterId})" />
      </svg>`;
    }

    function hydrateBrandLogos() {
      document.querySelectorAll('.prx-logo-slot').forEach((slot) => {
        const size = parseInt(slot.dataset.size || '28', 10);
        const id = slot.dataset.id || Math.random().toString(36).slice(2, 7);
        slot.innerHTML = createPramanixLogoSVG(size, id, false);
      });
    }

    function downloadBrandSVG() {
      const svgMarkup = createPramanixLogoSVG(512, 'export', true);
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pramanixlabs-monogram-dark.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    hydrateBrandLogos();

    // =========================================================================
    // 1. EXACT 2D POINT-IN-LOGO SAMPLER (MATCHING ROUNDED INNER CUTOUTS)
    // =========================================================================
    function isInsideRoundedRect(px, py, x0, y0, x1, y1, r) {
      if (px < x0 || px > x1 || py < y0 || py > y1) return false;
      const cx = Math.max(x0 + r, Math.min(px, x1 - r));
      const cy = Math.max(y0 + r, Math.min(py, y1 - r));
      const dx = px - cx;
      const dy = py - cy;
      return dx * dx + dy * dy <= r * r;
    }

    function samplePramanixMonolithPoint() {
      // Normalized coordinate space: X in [-1.0, 1.0], Y in [-1.25, 1.25]
      // 11% of particles form the blazing central vertical cyan laser axis
      if (Math.random() < 0.11) {
        return {
          x: (Math.random() - 0.5) * 0.036,
          y: (Math.random() - 0.5) * 2.68, // Extends past top & bottom of wings
          z: (Math.random() - 0.5) * 0.18,
          isAxis: true,
        };
      }

      // Rejection sample inside exact mirrored 3-prong monolith silhouette with rounded cutouts
      for (let attempt = 0; attempt < 40; attempt++) {
        const isRight = Math.random() >= 0.5;
        // Wing X span: [0.09, 0.84], Y span: [-1.15, 1.15]
        const absX = 0.09 + Math.random() * 0.75;
        const y = (Math.random() - 0.5) * 2.30;

        // Upper cutout bay: X in [0.44, 0.86], Y in [0.16, 0.76], corner radius 0.14
        const inTopCutout = isInsideRoundedRect(absX, y, 0.44, 0.16, 0.88, 0.76, 0.15);
        // Lower cutout bay: X in [0.44, 0.86], Y in [-0.76, -0.16], corner radius 0.14
        const inBotCutout = isInsideRoundedRect(absX, y, 0.44, -0.76, 0.88, -0.16, 0.15);

        if (!inTopCutout && !inBotCutout) {
          // Bias slightly toward edges for crisp architectural silhouette definition
          const zDepth = (Math.random() - 0.5) * 0.42;
          return {
            x: (isRight ? absX : -absX) * 1.48,
            y: y * 1.48,
            z: zDepth,
            isAxis: false,
          };
        }
      }

      return { x: 0.25, y: 0, z: 0, isAxis: false };
    }

    // =========================================================================
    // 2. 65,000 GPU PARTICLE UNIVERSE + VOLUMETRIC GOD-RAYS + ORBITING SPARKS
    // =========================================================================
    let monolithPulseUniform = null;

    // Declared before the render loop starts. animate() reads this during its first
    // synchronous frame, so a later `let` would hit the temporal dead zone and abort
    // the whole boot sequence, leaving the preloader on screen forever.
    let prxLenis = null;

    (function initCosmicUniverse() {
      const canvas = document.getElementById('cosmic-canvas');
      if (!canvas || typeof THREE === 'undefined') {
        console.warn('[cosmic] THREE.js unavailable - static backdrop in use.');
        return;
      }

      try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
      });
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x020308, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 120);
      camera.position.set(0, 0, 6.2);

      // Adaptive particle count (65,000 desktop / 30,000 mobile)
      const isMobile = window.innerWidth < 768;
      const COUNT = isMobile ? 42000 : 65000;

      const posPortal = new Float32Array(COUNT * 3);
      const posConduit = new Float32Array(COUNT * 3);
      const posMonolith = new Float32Array(COUNT * 3);
      const posHorizon = new Float32Array(COUNT * 3);
      const posBlackHole = new Float32Array(COUNT * 3);
      const posGalaxy = new Float32Array(COUNT * 3);
      const randoms = new Float32Array(COUNT * 3);
      const sizes = new Float32Array(COUNT);
      const logoFlags = new Float32Array(COUNT); // 1.0 = Central Laser Axis, 2.0 = Orbiting Spark, 0.0 = Monolith Body

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        const r1 = Math.random();
        const r2 = Math.random();
        const r3 = Math.random();
        randoms[i3] = r1;
        randoms[i3 + 1] = r2;
        randoms[i3 + 2] = r3;
        sizes[i] = 0.65 + Math.pow(r2, 1.45) * 1.65;

        // ---------------------------------------------------------------------
        // FORMATION 1: FIRE & ICE ENERGY PORTAL RING (Chapter 1)
        // ---------------------------------------------------------------------
        const theta = r1 * Math.PI * 2;
        const phi = r2 * Math.PI * 2;
        const majorR = 2.08 + 0.16 * Math.sin(theta * 5.0) + 0.11 * Math.cos(theta * 3.0);
        const tubeR = (0.28 + 0.12 * Math.sin(theta * 7.0)) * Math.pow(r3, 0.55);
        if (i < COUNT * 0.9) {
          posPortal[i3] = (majorR + tubeR * Math.cos(phi)) * Math.cos(theta);
          posPortal[i3 + 1] = (majorR + tubeR * Math.cos(phi)) * Math.sin(theta);
          posPortal[i3 + 2] = tubeR * Math.sin(phi) * 1.4;
        } else {
          posPortal[i3] = (r1 - 0.5) * 14.0;
          posPortal[i3 + 1] = (r2 - 0.5) * 9.0;
          posPortal[i3 + 2] = (r3 - 0.5) * 8.0 - 2.0;
        }

        // ---------------------------------------------------------------------
        // FORMATION 2: SCULPTED HOURGLASS WAVE CONDUIT (Chapter 2)
        // ---------------------------------------------------------------------
        const cy = (r1 - 0.5) * 6.8;
        const cAngle = r2 * Math.PI * 2;
        const waist = 0.72 + 0.38 * Math.pow(Math.abs(cy) / 3.4, 1.6) + 0.14 * Math.sin(cy * 2.2 + cAngle * 3.0);
        const shell = waist * (0.78 + 0.22 * r3);
        posConduit[i3] = Math.cos(cAngle) * shell * 1.35;
        posConduit[i3 + 1] = cy;
        posConduit[i3 + 2] = Math.sin(cAngle) * shell * 0.85;

        // ---------------------------------------------------------------------
        // FORMATION 3: 3D VOLUMETRIC PRAMANIXLABS MONOGRAM + ORBITING SPARKS
        // (Matching watermarked_img_11683992815522018908.png)
        // ---------------------------------------------------------------------
        if (i < COUNT * 0.045) {
          // Tilted elliptical golden-orange spark orbits circling the monolith
          const orbitRing = i % 2 === 0 ? 1 : -1;
          const orbAngle = r1 * Math.PI * 2;
          const orbR = 1.68 + (r2 - 0.5) * 0.24;
          const ox = Math.cos(orbAngle) * orbR;
          const oz = Math.sin(orbAngle) * orbR;
          const tiltAngle = orbitRing * 0.42;
          posMonolith[i3] = ox * Math.cos(tiltAngle) - (r3 - 0.5) * 0.15;
          posMonolith[i3 + 1] = ox * Math.sin(tiltAngle) + (r2 - 0.5) * 0.14;
          posMonolith[i3 + 2] = oz * 0.85;
          logoFlags[i] = 2.0;
          sizes[i] = 1.1 + r3 * 1.5;
        } else {
          const pt = samplePramanixMonolithPoint();
          posMonolith[i3] = pt.x;
          posMonolith[i3 + 1] = pt.y;
          posMonolith[i3 + 2] = pt.z;
          logoFlags[i] = pt.isAxis ? 1.0 : 0.0;
        }

        // ---------------------------------------------------------------------
        // FORMATION 4: FIRE & ICE HORIZON WAVE TERRAIN (Chapter 4)
        // ---------------------------------------------------------------------
        const hx = (r1 - 0.5) * 11.5;
        const hz = (r2 - 0.5) * 7.5;
        const ridge =
          Math.sin(hx * 0.85 + hz * 0.55) * 0.42 +
          Math.cos(hx * 1.4 - hz * 0.9) * 0.24 +
          (r3 - 0.5) * 0.14;
        posHorizon[i3] = hx;
        posHorizon[i3 + 1] = -1.35 + ridge - hz * 0.14;
        posHorizon[i3 + 2] = hz;

        // ---------------------------------------------------------------------
        // FORMATION 5: BLACK HOLE EVENT HORIZON SINGULARITY (Chapter 5)
        // ---------------------------------------------------------------------
        const bhAngle = r1 * Math.PI * 2;
        const eventHorizonR = 0.72;
        const radialDist = i < COUNT * 0.28
          ? eventHorizonR + Math.pow(r2, 2.2) * 0.26
          : eventHorizonR + 0.12 + Math.pow(r2, 1.35) * 4.2;
        const tunnelZ = (r3 - 0.5) * (radialDist > 1.2 ? 3.8 : 0.45);
        posBlackHole[i3] = Math.cos(bhAngle) * radialDist;
        posBlackHole[i3 + 1] = Math.sin(bhAngle) * radialDist;
        posBlackHole[i3 + 2] = tunnelZ;

        // ---------------------------------------------------------------------
        // FORMATION 6: TILTED SPIRAL GALAXY ECOSYSTEM (Chapter 6)
        // ---------------------------------------------------------------------
        const arms = 4;
        const armIdx = i % arms;
        const gRadius = Math.pow(r1, 0.78) * 4.5;
        const spin = gRadius * 1.55 + (armIdx / arms) * Math.PI * 2;
        const spread = (1.0 - gRadius / 4.8) * 0.55 + 0.14;
        const gx = Math.cos(spin) * gRadius + (r2 - 0.5) * spread * 2.1;
        const gy = (r3 - 0.5) * (0.58 / (1.0 + gRadius * 0.85));
        const gz = Math.sin(spin) * gRadius + (Math.random() - 0.5) * spread * 2.1;
        const tilt = 0.92;
        posGalaxy[i3] = gx;
        posGalaxy[i3 + 1] = gy * Math.cos(tilt) - gz * Math.sin(tilt) - 0.25;
        posGalaxy[i3 + 2] = gy * Math.sin(tilt) + gz * Math.cos(tilt);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(posPortal, 3));
      geometry.setAttribute('aPortal', new THREE.BufferAttribute(posPortal, 3));
      geometry.setAttribute('aConduit', new THREE.BufferAttribute(posConduit, 3));
      geometry.setAttribute('aMonolith', new THREE.BufferAttribute(posMonolith, 3));
      geometry.setAttribute('aHorizon', new THREE.BufferAttribute(posHorizon, 3));
      geometry.setAttribute('aBlackHole', new THREE.BufferAttribute(posBlackHole, 3));
      geometry.setAttribute('aGalaxy', new THREE.BufferAttribute(posGalaxy, 3));
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('aLogoFlag', new THREE.BufferAttribute(logoFlags, 1));

      const uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uPixelRatio: { value: dpr },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uPulse: { value: 0 },
        uMobile: { value: isMobile ? 1.0 : 0.0 },
      };
      monolithPulseUniform = uniforms.uPulse;

      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          uniform float uTime;
          uniform float uScroll;
          uniform float uPixelRatio;
          uniform vec2 uPointer;
          uniform float uPulse;
          uniform float uMobile;

          attribute vec3 aPortal;
          attribute vec3 aConduit;
          attribute vec3 aMonolith;
          attribute vec3 aHorizon;
          attribute vec3 aBlackHole;
          attribute vec3 aGalaxy;
          attribute vec3 aRandom;
          attribute float aSize;
          attribute float aLogoFlag;

          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            float w1 = smoothstep(0.10, 0.20, uScroll); // Portal -> Conduit
            float w2 = smoothstep(0.28, 0.37, uScroll); // Conduit -> 3D PramanixLabs Monogram
            float w3 = smoothstep(0.49, 0.58, uScroll); // Monogram -> Horizon
            float w4 = smoothstep(0.64, 0.74, uScroll); // Horizon -> Black Hole
            float w5 = smoothstep(0.80, 0.90, uScroll); // Black Hole -> Galaxy

            float isMonolith = w2 * (1.0 - w3);

            // Rotate orbiting spark particles around the Monolith in Chapter 3
            vec3 monoPos = aMonolith;
            if (aLogoFlag > 1.5 && isMonolith > 0.01) {
              float orbSpeed = uTime * 0.65;
              float os = sin(orbSpeed);
              float oc = cos(orbSpeed);
              monoPos.xz = mat2(oc, -os, os, oc) * monoPos.xz;
            }

            // Subtle interactive 3D yaw/pitch on the PramanixLabs Monogram so its silhouette remains crystal-clear
            if (isMonolith > 0.01) {
              float yaw = sin(uTime * 0.45) * 0.14 + uPointer.x * 0.28;
              float ys = sin(yaw);
              float yc = cos(yaw);
              monoPos.xz = mat2(yc, -ys, ys, yc) * monoPos.xz;
              // Centered hero monolith alignment matching the unobstructed reference frame
              monoPos.x += 0.16 * isMonolith;
            }

            vec3 pos = mix(aPortal, aConduit, w1);
            pos = mix(pos, monoPos, w2);
            pos = mix(pos, aHorizon, w3);
            pos = mix(pos, aBlackHole, w4);
            pos = mix(pos, aGalaxy, w5);

            // Keep the monogram clear of the services copy on narrow screens.
            if (isMonolith > 0.01 && uMobile > 0.5) {
              pos.xy *= 0.55;
              pos.y += 0.95 * isMonolith;
            }

            // Tighter harmonic micro-shimmer during Monolith stage so edges stay razor-sharp
            float driftScale = mix(0.075, 0.016, isMonolith);
            pos.x += sin(pos.y * 1.8 + uTime * 1.2 + aRandom.x * 6.2831) * driftScale;
            pos.y += cos(pos.x * 1.8 + uTime * 1.0 + aRandom.y * 6.2831) * driftScale;
            pos.z += sin(pos.z * 1.5 + uTime * 1.1 + aRandom.z * 6.2831) * driftScale;

            // Black hole & galaxy rotations
            float bhSpin = w4 * (1.0 - w5) * (uTime * 0.38);
            float galaxySpin = w5 * (uTime * 0.22);
            if (bhSpin > 0.001) {
              float s = sin(bhSpin);
              float c = cos(bhSpin);
              pos.xy = mat2(c, -s, s, c) * pos.xy;
            }
            if (galaxySpin > 0.001) {
              float s = sin(galaxySpin);
              float c = cos(galaxySpin);
              pos.xz = mat2(c, -s, s, c) * pos.xz;
            }

            // Mouse Gravity Attraction & Interactive Pulse
            vec3 pointer3D = vec3(uPointer.x * 3.1, uPointer.y * 2.1, 0.8);
            float dist = distance(pos, pointer3D);
            float pull = smoothstep(2.0, 0.0, dist);
            pos += normalize(pointer3D - pos + 0.001) * pull * (0.14 * (1.0 - isMonolith * 0.6));

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            float axisBoost = (aLogoFlag > 0.5 && aLogoFlag < 1.5) ? (1.35 + uPulse * 0.45) : 1.0;
            float sizeBoost = (1.0 + pull * 0.55) * axisBoost;
            gl_PointSize = aSize * uPixelRatio * (11.2 / -mvPosition.z) * sizeBoost;

            // -----------------------------------------------------------------
            // SIGNATURE FIRE & ICE COLOR GRADING + MONOLITH LASER AXIS
            // -----------------------------------------------------------------
            // Left Wing = Electric Sapphire Blue (#1D4ED8 -> #38BDF8)
            // Right Wing = Molten Coral-Orange & Crimson (#F97316 -> #F43F5E)
            float logoColorX = pos.x;
            if (isMonolith > 0.01 && uMobile > 0.5) logoColorX /= 0.40;
            float splitX = isMonolith > 0.1 ? (logoColorX - 0.38 * isMonolith) : pos.x;
            float lrMix = smoothstep(-0.18, 0.18, splitX);
            vec3 colIce = mix(vec3(0.12, 0.42, 0.98), vec3(0.28, 0.80, 1.0), aRandom.x);
            vec3 colFire = mix(vec3(0.99, 0.46, 0.12), vec3(0.95, 0.24, 0.32), aRandom.y);
            vec3 dualTone = mix(colIce, colFire, lrMix);

            // Central Vertical Laser Axis: Blazing Cyan-White (#FFFFFF -> #22D3EE)
            vec3 axisColor = mix(vec3(0.18, 0.92, 1.0), vec3(0.92, 0.99, 1.0), 0.65 + 0.35 * sin(uTime * 3.0 + pos.y * 4.0));
            // Orbiting Golden-Amber Sparks
            vec3 sparkColor = vec3(1.0, 0.62, 0.22);

            vec3 color = dualTone;
            if (isMonolith > 0.01) {
              if (aLogoFlag > 1.5) {
                color = mix(color, sparkColor, isMonolith);
              } else if (aLogoFlag > 0.5) {
                color = mix(color, axisColor, isMonolith);
              }
            }

            // Chapter 5 Black Hole Photon Ring Glow
            float isBH = w4 * (1.0 - w5);
            float r2D = length(pos.xy);
            float photonRing = smoothstep(1.18, 0.72, r2D) * smoothstep(0.66, 0.74, r2D);
            color = mix(color, vec3(0.92, 0.72, 1.0), isBH * photonRing * 0.95);

            // Chapter 6 Spiral Galaxy Core Glow
            float coreDist = length(pos.xz);
            float galaxyCore = smoothstep(1.8, 0.0, coreDist) * w5;
            color = mix(color, vec3(1.0, 0.86, 0.76), galaxyCore * 0.85);

            vColor = color;
            float baseAlpha = (aLogoFlag > 0.5 && aLogoFlag < 1.5) ? 0.95 : (0.48 + 0.48 * aRandom.x);
            float studioText = smoothstep(0.12, 0.16, uScroll) * (1.0 - smoothstep(0.29, 0.33, uScroll));
          float processText = smoothstep(0.50, 0.54, uScroll) * (1.0 - smoothstep(0.66, 0.70, uScroll));
          float briefText = smoothstep(0.66, 0.70, uScroll) * (1.0 - smoothstep(0.81, 0.85, uScroll));
          float serviceText = smoothstep(0.82, 0.86, uScroll);
          float textFocus = max(max(studioText, processText), max(briefText, serviceText));
          vAlpha = baseAlpha * smoothstep(18.0, 2.2, -mvPosition.z) * (1.0 - 0.25 * textFocus);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float glow = smoothstep(0.5, 0.06, d);
            gl_FragColor = vec4(vColor, glow * vAlpha);
          }
        `,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Volumetric God-Ray Streaks Behind the 3D Logo Monolith (Visible in Chapter 3)
      const rayGroup = new THREE.Group();
      rayGroup.position.set(0.16, 0, -1.2);
      const rayGeo = new THREE.PlaneGeometry(0.18, 7.5);
      const rayMatBlue = new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const rayMatOrange = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      for (let r = 0; r < 14; r++) {
        const isRightRay = r % 2 === 0;
        const rayMesh = new THREE.Mesh(rayGeo, isRightRay ? rayMatOrange : rayMatBlue);
        const spreadAngle = (isRightRay ? -1 : 1) * (0.25 + (r / 14) * 1.15);
        rayMesh.rotation.z = spreadAngle;
        rayMesh.scale.x = 0.6 + (r % 3) * 0.5;
        rayGroup.add(rayMesh);
      }
      scene.add(rayGroup);

      // Smooth Inertia Scroll & Pointer State
      let targetScroll = 0;
      let currentScroll = 0;
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

      const chapterEls = Array.from({ length: 6 }, (_, i) => document.getElementById(`chapter-${i}`));
      const dotEls = Array.from(document.querySelectorAll('.chapter-dot'));
      const navProgress = document.getElementById('nav-progress');
      let lastActiveChapter = -1;

      function updateChapterUI(progress) {
        if (navProgress) {
          navProgress.style.width = `${(progress * 100).toFixed(2)}%`;
        }

        let idx = 0;
        if (progress >= 0.84) idx = 5;
        else if (progress >= 0.68) idx = 4;
        else if (progress >= 0.52) idx = 3;
        else if (progress >= 0.31) idx = 2;
        else if (progress >= 0.14) idx = 1;
        else idx = 0;

        if (idx !== lastActiveChapter) {
          lastActiveChapter = idx;
          chapterEls.forEach((el, i) => {
            if (!el) return;
            if (i === idx) el.classList.add('active');
            else el.classList.remove('active');
          });
          dotEls.forEach((btn, i) => {
            if (i === idx) btn.setAttribute('aria-current', 'step');
            else btn.removeAttribute('aria-current');
            const dot = btn.querySelector('.dot-indicator');
            if (!dot) return;
            if (i === idx) {
              dot.classList.remove('bg-white/25');
              dot.classList.add('bg-white', 'scale-125', 'shadow-[0_0_10px_#fff]');
            } else {
              dot.classList.add('bg-white/25');
              dot.classList.remove('bg-white', 'scale-125', 'shadow-[0_0_10px_#fff]');
            }
          });
        }

        // Auto-scroll Chapter 6 content down to reveal footer as user scrolls the final stretch
        const chapter5 = chapterEls[5];
        if (chapter5) {
          if (progress >= 0.84) {
            const ch5Factor = Math.min(1, Math.max(0, (progress - 0.84) / 0.16));
            const maxScroll = chapter5.scrollHeight - chapter5.clientHeight;
            if (maxScroll > 0) {
              chapter5.scrollTop = ch5Factor * maxScroll;
            }
          } else {
            chapter5.scrollTop = 0;
          }
        }
      }

      window.updateTargetScroll = function(scrollY) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetScroll = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      };

      window.addEventListener('scroll', () => {
        window.updateTargetScroll(window.scrollY);
      }, { passive: true });

      window.addEventListener('pointermove', (e) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = -(e.clientY / window.innerHeight) * 2 + 1;
      }, { passive: true });

      if (!window.__PRX_STUDIO_POLISH_BOUND__) {
        window.__PRX_STUDIO_POLISH_BOUND__ = true;

        document.querySelectorAll('.hud-glass').forEach((card) => {
          if (card.dataset.spotlightBound) return;
          card.dataset.spotlightBound = 'true';
          card.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }, { passive: true });
          card.addEventListener('pointerenter', () => {
            if (typeof monolithPulseUniform !== 'undefined' && monolithPulseUniform) {
              monolithPulseUniform.value = 0.85;
            }
          }, { passive: true });
          card.addEventListener('pointerleave', () => {
            card.style.setProperty('--mouse-x', '-1000px');
            card.style.setProperty('--mouse-y', '-1000px');
          }, { passive: true });
        });

        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          document.querySelectorAll('.pill-cta-primary, .pill-cta-secondary').forEach((btn) => {
            if (btn.dataset.magnetBound) return;
            btn.dataset.magnetBound = 'true';
            btn.addEventListener('pointermove', (e) => {
              const r = btn.getBoundingClientRect();
              const dx = ((e.clientX - (r.left + r.width / 2)) * 0.22).toFixed(1);
              const dy = ((e.clientY - (r.top + r.height / 2)) * 0.28).toFixed(1);
              btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
            });
            btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
          });
        }
      }

      const clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);

        const lerpSpeed = prxLenis ? 0.32 : 0.16;
        currentScroll += (targetScroll - currentScroll) * lerpSpeed;
        if (Math.abs(targetScroll - currentScroll) < 0.0003) {
          currentScroll = targetScroll;
        }
        pointer.x += (pointer.tx - pointer.x) * 0.14;
        pointer.y += (pointer.ty - pointer.y) * 0.14;

        uniforms.uTime.value = clock.getElapsedTime();
        uniforms.uScroll.value = currentScroll;
        uniforms.uPointer.value.set(pointer.x, pointer.y);
        uniforms.uPulse.value *= 0.92;

        // Fade volumetric god-rays in smoothly during Chapter 3 (3D Logo Monolith)
        const w2 = Math.max(0, Math.min(1, (currentScroll - 0.28) / 0.09));
        const w3 = Math.max(0, Math.min(1, (currentScroll - 0.49) / 0.09));
        const monoStrength = w2 * (1 - w3);
        rayMatBlue.opacity = monoStrength * 0.042;
        rayMatOrange.opacity = monoStrength * 0.042;

        // Camera Singularity Dive Zoom in Chapter 5
        const divePulse = Math.sin(Math.max(0, Math.min(1, (currentScroll - 0.65) / 0.22)) * Math.PI);
        const targetCamZ = 6.2 - divePulse * 2.15;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.position.x = pointer.x * 0.2;
        camera.position.y = pointer.y * 0.14;
        camera.lookAt(0, 0, 0);

        updateChapterUI(currentScroll);
        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
      } catch (err) {
        console.warn('[cosmic] WebGL scene failed to initialise - static backdrop in use.', err);
      }
    })();

    // =========================================================================
    // 3. CHAPTER JUMP NAVIGATION, CAPABILITY PULSE & PROJECT FILTERING
    // =========================================================================
    const CHAPTER_SCROLL_TARGETS = [0.0, 0.22, 0.42, 0.59, 0.75, 1.0];
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
      prxLenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
      });
      window.prxLenis = prxLenis;
      prxLenis.on('scroll', (e) => {
        if (window.updateTargetScroll) window.updateTargetScroll(e.scroll);
      });
      const lenisFrame = (time) => {
        prxLenis.raf(time);
        requestAnimationFrame(lenisFrame);
      };
      requestAnimationFrame(lenisFrame);
    }

    function jumpToChapter(index) {
      const targetRatio = CHAPTER_SCROLL_TARGETS[index] ?? 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const destination = maxScroll * targetRatio;
      if (prxLenis) prxLenis.scrollTo(destination);
      else window.scrollTo({ top: destination, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    function filterProjects(category) {
      document.querySelectorAll('.filter-btn').forEach((btn) => {
        if (btn.dataset.filter === category) {
          btn.classList.add('bg-white', 'text-slate-950');
          btn.classList.remove('text-slate-300');
        } else {
          btn.classList.remove('bg-white', 'text-slate-950');
          btn.classList.add('text-slate-300');
        }
      });

      document.querySelectorAll('.project-card').forEach((card) => {
        const exists = card.dataset.present !== 'false';
        if (exists && (category === 'all' || card.dataset.category === category)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // =========================================================================
    // 4. PROJECT ARCHITECTURE DRAWER & DIRECT STUDIO INQUIRY MODAL
    // =========================================================================
    const PROJECTS_DATA = {
      restovra: {
        stage: 'IN DEVELOPMENT · RECOVERY ASSURANCE',
        title: 'Restovra',
        summary: 'A self-hosted recovery assurance workbench that turns authorised database backups into reviewed recovery drills and evidence teams can inspect.',
        privacy: '🔒 Source kept private',
        topology: [
          '01 · Authorised database backups',
          '02 · Reviewed recovery drills',
          '03 · Inspectable recovery evidence',
        ],
      },
      kavachscan: {
        stage: 'CONTROLLED EVALUATION · CYBERSECURITY',
        title: 'KavachScan',
        summary: 'A consent-first, read-only website security checker for small businesses in India. It turns selected public website and email settings into plain-language observations and practical next steps.',
        privacy: '🔒 Source kept private',
        topology: [
          '01 · Selected public website and email settings',
          '02 · Consent-first, read-only checks',
          '03 · Plain-language observations and next steps',
        ],
      },
      'pramanix-ai': {
        stage: 'PUBLIC REPOSITORY · AI LEARNING',
        title: 'Pramanix AI',
        summary: 'An AI engineering mentor and capstone companion exploring project architecture, software concepts, debugging and viva preparation for engineering students.',
        privacy: 'Public repository',
        topology: [
          'AI engineering mentor and capstone companion',
          'Architecture, software concepts and debugging',
          'Viva preparation for engineering students',
        ],
      },
      'second-life-id': {
        stage: 'IN EXPLORATION · DIGITAL IDENTITY',
        title: 'SECOND LIFE ID',
        summary: 'An early-stage identity concept in the PramanixLabs portfolio. Scope and product details are still being explored.',
        privacy: '✦ Early-stage concept',
        topology: [
          'Product scope is still being explored.',
        ],
      },
      'pramanix-shelf': {
        stage: 'IN EXPLORATION · DIGITAL LEARNING',
        title: 'Pramanix Shelf',
        summary: 'A reading and learning experience in early exploration. The product shape is still being worked out.',
        privacy: '✦ Early-stage concept',
        topology: [
          'Product scope is still being explored.',
        ],
      },
    };

    function applyProjects(projects) {
      if (!Array.isArray(projects)) return;
      const keysByCode = { '01': 'restovra', '02': 'kavachscan', '03': 'pramanix-ai', '04': 'second-life-id', '05': 'pramanix-shelf' };
      const grid = document.getElementById('projects-grid');
      if (!grid) return;
      const cards = new Map(Array.from(grid.querySelectorAll('[data-project-code]')).map(card => [card.dataset.projectCode, card]));
      const ordered = [];
      const incomingCodes = new Set(projects.map(project => String(project.code ?? '')));
      cards.forEach((card, code) => { card.dataset.present = incomingCodes.has(code) ? 'true' : 'false'; });

      projects.forEach(project => {
        const code = String(project.code ?? '');
        const card = cards.get(code);
        const key = keysByCode[code];
        const drawer = PROJECTS_DATA[key];
        if (!card || !drawer) return;
        const title = card.querySelector('h3');
        const description = card.querySelector('p');
        const status = card.querySelector('[data-project-status]');
        const image = card.querySelector('[data-project-image]');
        const horizonCard = document.querySelector(`[data-horizon-code="${code}"]`);
        if (title) title.textContent = project.name;
        if (description) description.textContent = project.description;
        if (status) status.textContent = project.status;
        if (image) {
          if (project.image_url) {
            image.src = project.image_url;
            image.alt = project.image_alt || `${project.name} project image`;
            image.classList.remove('hidden');
          } else {
            image.removeAttribute('src');
            image.alt = '';
            image.classList.add('hidden');
          }
        }
        card.dataset.category = project.upcoming ? 'exploration' : 'active';
        drawer.title = project.name;
        drawer.summary = project.description;
        drawer.stage = `${project.status} · ${project.category}`;
        if (horizonCard) {
          const horizonTitle = horizonCard.querySelector('h3');
          const horizonDescription = horizonCard.querySelector('p:last-child');
          if (horizonTitle) horizonTitle.textContent = project.name;
          if (horizonDescription) horizonDescription.textContent = project.description;
          horizonCard.classList.toggle('hidden', !project.upcoming);
        }
        ordered.push(card);
      });

      ordered.forEach(card => grid.appendChild(card));
      const activeCount = projects.filter(project => !project.upcoming).length;
      const explorationCount = projects.filter(project => project.upcoming).length;
      const horizonEmpty = document.getElementById('horizon-empty');
      if (horizonEmpty) horizonEmpty.classList.toggle('hidden', explorationCount > 0);
      document.querySelector('[data-filter="all"]').textContent = `All (${projects.length})`;
      document.querySelector('[data-filter="active"]').textContent = `Active (${activeCount})`;
      document.querySelector('[data-filter="exploration"]').textContent = `R&D / Shelf (${explorationCount})`;
      filterProjects(document.querySelector('.filter-btn.bg-white')?.dataset.filter ?? 'all');
    }

    function openProjectDrawer(key) {
      const data = PROJECTS_DATA[key];
      if (!data) return;
      const simOut = document.getElementById('drawer-sim-output');
      if (simOut) {
        simOut.classList.add('hidden');
        simOut.textContent = '';
      }
      document.getElementById('drawer-stage').textContent = data.stage;
      document.getElementById('drawer-title').textContent = data.title;
      document.getElementById('drawer-summary').textContent = data.summary;
      document.getElementById('drawer-privacy').textContent = data.privacy;

      document.getElementById('drawer-topology').innerHTML = data.topology
        .map((step, idx) => {
          const [nodeLabel, nodeDetail] = step.split('→').map((s) => s.trim());
          const isLast = idx === data.topology.length - 1;
          return `<li class="relative">
            <div class="p-3.5 rounded-xl bg-white/[0.04] border border-white/12 hover:border-sky-400/40 transition-colors flex items-start justify-between gap-3">
              <div>
                <div class="font-mono text-[11px] font-medium text-sky-300">${nodeLabel}</div>
                ${nodeDetail ? `<div class="text-xs text-slate-300 mt-0.5">${nodeDetail}</div>` : ''}
              </div>
              <span class="shrink-0 mt-1 w-2 h-2 rounded-full ${isLast ? 'bg-orange-400 shadow-[0_0_8px_#fb923c]' : 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'}"></span>
            </div>
            ${!isLast ? `<div class="flex justify-center my-0.5" aria-hidden="true">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <line x1="8" y1="0" x2="8" y2="18" stroke="rgba(56,189,248,0.55)" stroke-width="1.5" class="topology-flow-line" />
              </svg></div>` : ''}
          </li>`;
        }).join('');

      document.getElementById('drawer-inquire-btn').onclick = () => {
        closeProjectDrawer();
        openInquiryModal(`Architecture Inquiry: ${data.title}`);
      };

      document.getElementById('project-drawer').classList.add('open');
    }

    function closeProjectDrawer() {
      document.getElementById('project-drawer').classList.remove('open');
    }

    function openInquiryModal(topic) {
      const topics = Array.from(document.querySelectorAll('input[name="topic"]'));
      const selectedTopic = topics.find(input => input.value === topic) || topics.find(input => input.value === 'Something else');
      if (selectedTopic) selectedTopic.checked = true;
      document.getElementById('inquiry-modal').classList.add('open');
    }

    function closeInquiryModal() {
      document.getElementById('inquiry-modal').classList.remove('open');
    }

    function copyStudioEmail() {
      const el = document.createElement('input');
      el.value = 'pramanixlabs@gmail.com';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      const btn = document.getElementById('copy-email-btn');
      if (btn) {
        btn.textContent = '✓ Copied pramanixlabs@gmail.com';
        setTimeout(() => {
          btn.textContent = 'pramanixlabs@gmail.com (Copy)';
        }, 2200);
      }
    }

    let inquiryConfig = null;
    let studioBookingUrl = null;

    function openBookingOrInquiry(topic = 'Something else') {
      if (studioBookingUrl) {
        window.open(studioBookingUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      openInquiryModal(topic);
    }

    window.addEventListener('message', event => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === 'PRAMANIX_PROJECTS_DATA') {
        applyProjects(event.data.projects);
        return;
      }
      if (event.data?.type !== 'PRAMANIX_SUPABASE_CONFIG') return;
      const { url, anonKey, bookingUrl } = event.data;
      if (typeof bookingUrl === 'string') {
        try { const parsed = new URL(bookingUrl); studioBookingUrl = parsed.protocol === 'https:' ? parsed.href : null; } catch { studioBookingUrl = null; }
      }
      if (typeof url === 'string' && typeof anonKey === 'string' && url && anonKey) {
        inquiryConfig = { url: url.replace(/\/$/, ''), anonKey };
      }
    });

    async function handleInquirySubmit(e) {
      e.preventDefault();
      const form = e.currentTarget;
      const name = document.getElementById('inq-name').value.trim();
      const email = document.getElementById('inq-email').value.trim();
      const topic = document.querySelector('input[name="topic"]:checked')?.value.trim() || 'Something else';
      const msg = document.getElementById('inq-msg').value.trim();
      const organization = document.getElementById('inq-organization').value.trim();
      const timeline = document.getElementById('inq-timeline').value.trim();
      const fullMessage = [msg, organization && 'Company or organization: ' + organization, timeline && 'Preferred timing: ' + timeline].filter(Boolean).join('\n\n');
      const companyWebsite = document.getElementById('inq-company-website').value.trim();
      const feedback = document.getElementById('inq-feedback');
      const feedbackText = document.getElementById('inq-feedback-text');
      const emailFallback = document.getElementById('inq-email-fallback');
      const whatsappFollowup = document.getElementById('inq-whatsapp-followup');
      const successIcon = document.getElementById('inq-success-icon');
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      feedback.classList.remove('hidden');
      emailFallback.classList.add('hidden');
      whatsappFollowup.classList.add('hidden');
      successIcon.classList.add('hidden');
      successIcon.classList.remove('flex');

      const subject = encodeURIComponent('[PramanixLabs] ' + topic + ' — ' + name);
      const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nTopic: ' + topic + '\n\n' + fullMessage);
      emailFallback.href = 'mailto:pramanixlabs@gmail.com?subject=' + subject + '&body=' + body;
      whatsappFollowup.href = 'https://wa.me/919653176072?text=' + encodeURIComponent('Hi PramanixLabs, I sent an enquiry about ' + topic + '. My name is ' + name + '.');

      if (!inquiryConfig) {
        feedbackText.textContent = 'Online enquiry delivery is unavailable right now. Use the email draft below to send your request.';
        emailFallback.classList.remove('hidden');
        whatsappFollowup.classList.remove('hidden');
        submit.disabled = false;
        return;
      }

      feedbackText.textContent = 'Sending your request…';
      try {
        const response = await fetch(inquiryConfig.url + '/functions/v1/submit-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: inquiryConfig.anonKey,
            Authorization: 'Bearer ' + inquiryConfig.anonKey,
          },
          body: JSON.stringify({ name, email, topic, message: fullMessage, company_website: companyWebsite }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success !== true) {
          throw new Error('The online enquiry service is unavailable right now.');
        }
        feedbackText.textContent = result.emailSent
          ? 'Enquiry received. We’ll follow up at the email address you provided.'
          : 'Enquiry received. Continue the conversation with us on WhatsApp.';
        successIcon.classList.remove('hidden');
        successIcon.classList.add('flex');
        whatsappFollowup.classList.remove('hidden');
        form.reset();
      } catch {
        feedbackText.textContent = 'We could not send this request online. Use the email draft below to contact us.';
        emailFallback.classList.remove('hidden');
        whatsappFollowup.classList.remove('hidden');
      } finally {
        submit.disabled = false;
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProjectDrawer();
        closeInquiryModal();
      }
      const target = e.target;
      const typing = target && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
      if (e.shiftKey && e.key.toLowerCase() === 'b' && !typing) {
        document.body.classList.toggle('blueprint-grid');
      }
    });

    // =========================================================================
    // 5. DESKTOP-ONLY OPTICAL RETICLE CURSOR
    // =========================================================================
    (function initReticleCursor() {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      if (window.__PRX_CURSOR_BOUND__) return;
      window.__PRX_CURSOR_BOUND__ = true;

      const dot = document.createElement('div');
      dot.className = 'studio-cursor-dot';
      const ring = document.createElement('div');
      ring.className = 'studio-cursor-ring';
      document.body.appendChild(dot);
      document.body.appendChild(ring);

      let cx = -100, cy = -100;
      let rx = -100, ry = -100;

      document.addEventListener('pointermove', (e) => {
        cx = e.clientX;
        cy = e.clientY;
      }, { passive: true });

      document.addEventListener('pointerover', (e) => {
        const interactive = e.target.closest('button, a, [data-action], .hud-glass, .pill-cta-primary, .pill-cta-secondary, input, textarea, select');
        if (interactive) ring.classList.add('hovering');
        else ring.classList.remove('hovering');
      }, { passive: true });

      document.addEventListener('pointerleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
      }, { passive: true });

      document.addEventListener('pointerenter', () => {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }, { passive: true });

      (function animateCursor() {
        rx += (cx - rx) * 0.16;
        ry += (cy - ry) * 0.16;
        dot.style.left = cx + 'px';
        dot.style.top = cy + 'px';
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateCursor);
      })();
    })();

    // =========================================================================
    // 6. AMBIENT SOUNDTRACK + MICRO-TICKS (PREFERENCE PERSISTS ACROSS RELOADS)
    // =========================================================================
    const AUDIO_PREF_KEY = 'prx.ambient-audio';
    let studioAudioCtx = null;
    let studioAudioEnabled = false;
    let ambientNodes = null;
    let ambientChordTimer = null;
    let ambientChordIndex = 0;

    // Slow, consonant chord bed: Am7 -> Fmaj7 -> Cmaj7 -> Gmaj7
    const AMBIENT_CHORDS = [
      [110.00, 164.81, 261.63, 392.00],
      [87.31, 130.81, 220.00, 329.63],
      [130.81, 196.00, 329.63, 493.88],
      [98.00, 146.83, 246.94, 369.99]
    ];

    function setAudioToggleState(enabled) {
      document.querySelectorAll('[data-audio-toggle]').forEach((btn) => {
        btn.textContent = enabled ? '🔊' : '🔇';
        btn.setAttribute('aria-pressed', String(enabled));
        btn.setAttribute('aria-label', enabled ? 'Mute ambient audio' : 'Play ambient audio');
        btn.setAttribute('title', enabled ? 'Mute ambient audio' : 'Play ambient audio');
      });
    }

    function ensureAudioContext() {
      if (!studioAudioCtx) {
        studioAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (studioAudioCtx.state === 'suspended') studioAudioCtx.resume();
      return studioAudioCtx;
    }

    // Noise-decay impulse: gives the pad a long, soft "deep space" tail
    function makeReverbImpulse(ctx, seconds, decay) {
      const rate = ctx.sampleRate;
      const length = Math.floor(rate * seconds);
      const impulse = ctx.createBuffer(2, length, rate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
      }
      return impulse;
    }

    function startAmbient() {
      if (ambientNodes) return;
      const ctx = ensureAudioContext();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.14, now + 6);
      master.connect(ctx.destination);

      const reverb = ctx.createConvolver();
      reverb.buffer = makeReverbImpulse(ctx, 3.6, 2.6);
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      reverb.connect(wet);
      wet.connect(master);

      // Soft pad, filtered well below the sparkle so it sits under the page
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(700, now);
      padFilter.Q.value = 0.4;
      padFilter.connect(master);
      padFilter.connect(reverb);

      const voices = AMBIENT_CHORDS[0].map((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(i % 2 ? 4 : -4, now);
        const gain = ctx.createGain();
        gain.gain.value = i === 0 ? 0.2 : 0.085;
        osc.connect(gain);
        gain.connect(padFilter);
        osc.start();
        return { osc, gain };
      });

      // Very quiet high shimmer that drifts slowly, like distant starlight
      const shimmer = ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(AMBIENT_CHORDS[0][2] * 2, now);
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.012;
      const shimmerLfo = ctx.createOscillator();
      shimmerLfo.frequency.value = 0.06;
      const shimmerLfoGain = ctx.createGain();
      shimmerLfoGain.gain.value = 0.008;
      shimmerLfo.connect(shimmerLfoGain);
      shimmerLfoGain.connect(shimmerGain.gain);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(reverb);
      shimmer.start();
      shimmerLfo.start();

      // Filtered noise "air" layer with a very slow swell
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < samples.length; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        samples[i] = last * 3.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1500;
      noiseFilter.Q.value = 0.6;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.03;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.04;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.018;
      lfo.connect(lfoGain);
      lfoGain.connect(noiseGain.gain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noiseGain.connect(reverb);
      noise.start();
      lfo.start();

      ambientNodes = { master, reverb, wet, padFilter, voices, shimmer, shimmerGain, shimmerLfo, noise, noiseGain, lfo };

      ambientChordTimer = setInterval(() => {
        if (!ambientNodes) return;
        ambientChordIndex = (ambientChordIndex + 1) % AMBIENT_CHORDS.length;
        const chord = AMBIENT_CHORDS[ambientChordIndex];
        const t = ctx.currentTime;
        ambientNodes.voices.forEach((voice, i) => voice.osc.frequency.setTargetAtTime(chord[i], t, 2.6));
        ambientNodes.shimmer.frequency.setTargetAtTime(chord[2] * 2, t, 3.2);
      }, 16000);
    }

    function stopAmbient() {
      if (ambientChordTimer) { clearInterval(ambientChordTimer); ambientChordTimer = null; }
      if (!ambientNodes || !studioAudioCtx) { ambientNodes = null; return; }
      const dying = ambientNodes;
      ambientNodes = null;
      const stopAt = studioAudioCtx.currentTime + 2.2;
      try {
        dying.master.gain.cancelScheduledValues(studioAudioCtx.currentTime);
        dying.master.gain.setTargetAtTime(0.0001, studioAudioCtx.currentTime, 0.6);
        dying.voices.forEach((voice) => voice.osc.stop(stopAt));
        dying.shimmer.stop(stopAt);
        dying.shimmerLfo.stop(stopAt);
        dying.noise.stop(stopAt);
        dying.lfo.stop(stopAt);
        setTimeout(() => { try { dying.master.disconnect(); } catch (e) {} }, 2400);
      } catch (e) { /* already stopped */ }
    }

    function setStudioAudio(enabled, silentTick) {
      studioAudioEnabled = enabled;
      setAudioToggleState(enabled);
      try { localStorage.setItem(AUDIO_PREF_KEY, enabled ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
      if (enabled) {
        try {
          ensureAudioContext();
          startAmbient();
          if (!silentTick) playMicroTick();
        } catch (e) {
          document.querySelectorAll('[data-audio-toggle]').forEach((btn) => { btn.textContent = '⚠️'; });
        }
      } else {
        stopAmbient();
      }
    }

    function toggleStudioAudio() {
      setStudioAudio(!studioAudioEnabled);
    }

    function playMicroTick() {
      if (!studioAudioEnabled || !studioAudioCtx) return;
      try {
        const osc = studioAudioCtx.createOscillator();
        const gain = studioAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2800 + Math.random() * 800, studioAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, studioAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, studioAudioCtx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(studioAudioCtx.destination);
        osc.start();
        osc.stop(studioAudioCtx.currentTime + 0.06);
      } catch (e) { /* silently fail for strict autoplay policies */ }
    }

    // Attach micro-tick sounds to interactive hover events
    document.querySelectorAll('.hud-glass, .pill-cta-primary, .pill-cta-secondary, .chapter-dot, .nav-link').forEach((el) => {
      el.addEventListener('pointerenter', () => { playMicroTick(); }, { passive: true });
    });

    // Restore the visitor's choice; the soundtrack plays unless they muted it.
    // Browsers block audio until the page is interacted with, so start now and
    // fall back to the first gesture when autoplay is refused.
    (function restoreAudioPreference() {
      let stored = null;
      try { stored = localStorage.getItem(AUDIO_PREF_KEY); } catch (e) { /* storage blocked */ }
      studioAudioEnabled = stored !== 'off';
      setAudioToggleState(studioAudioEnabled);
      if (!studioAudioEnabled) return;

      const startOnGesture = () => {
        if (!studioAudioEnabled) return;
        try {
          ensureAudioContext();
          if (!ambientNodes) startAmbient();
        } catch (e) { /* autoplay blocked */ }
      };
      ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((type) => {
        window.addEventListener(type, (event) => {
          // Let the toggle itself decide; avoid a blip when muting a muted page.
          if (event.target && event.target.closest && event.target.closest('[data-audio-toggle]')) return;
          startOnGesture();
        }, { passive: true });
      });

      // Try to play immediately; if the browser refuses, the listeners above
      // start the soundtrack on the visitor's first interaction.
      startOnGesture();
    })();

    // Pause the soundtrack while the tab is hidden to save battery
    document.addEventListener('visibilitychange', () => {
      if (!studioAudioCtx || !studioAudioEnabled) return;
      if (document.hidden) { studioAudioCtx.suspend(); } else { studioAudioCtx.resume(); }
    });

    // =========================================================================
    // 7. LIVE DIAGNOSTIC SIMULATION RUNNER (PROJECT DRAWER)
    // =========================================================================
    let simRunning = false;

    function runProjectSimulation() {
      if (simRunning) return;
      const output = document.getElementById('drawer-sim-output');
      const btn = document.getElementById('drawer-sim-btn');
      if (!output || !btn) return;
      simRunning = true;
      output.classList.remove('hidden');
      output.textContent = '';
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';

      const title = (document.getElementById('drawer-title').textContent || 'Project').trim();
      const lines = [
        '> Initializing ' + title + ' diagnostic scan...',
        '> Loading project configuration manifest...',
        '> Verifying module dependency tree... OK',
        '> Running architecture integrity check...',
        '> Analyzing data-flow topology graph...',
        '> Validating security boundaries... PASS',
        '> Testing API endpoint connectivity... OK',
        '> Benchmarking response latency: p95 < 120ms',
        '> Memory footprint: within threshold ✓',
        '> Static analysis: 0 warnings, 0 errors',
        '> All subsystems nominal ✓',
        '> Diagnostic complete — ' + title + ' deployment-ready.',
      ];

      let i = 0;
      function typeLine() {
        if (i < lines.length) {
          output.textContent += (i > 0 ? '\n' : '') + lines[i];
          output.scrollTop = output.scrollHeight;
          playMicroTick();
          i++;
          setTimeout(typeLine, 160 + Math.random() * 240);
        } else {
          simRunning = false;
          btn.style.opacity = '1';
          btn.style.pointerEvents = '';
        }
      }
      typeLine();
    }

  // =========================================================================
  // 9. DELEGATED UI ACTIONS (CSP: no inline event handlers)
  // =========================================================================
  document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');
    if (action === 'stop') return;
    switch (action) {
      case 'chapter': jumpToChapter(Number(el.getAttribute('data-index'))); break;
      case 'toggle-audio': toggleStudioAudio(); break;
      case 'booking': openBookingOrInquiry(el.getAttribute('data-topic')); break;
      case 'inquiry': openInquiryModal(el.getAttribute('data-topic')); break;
      case 'close-drawer': closeProjectDrawer(); break;
      case 'close-modal': closeInquiryModal(); break;
      case 'run-sim': runProjectSimulation(); break;
      default: break;
    }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.matches('[data-form="inquiry"]')) handleInquirySubmit(event);
  });
