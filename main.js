// Register GSAP ScrollTrigger if available
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initThemeToggle();
  initCustomCursor();
  initThreeJSGlobe();
  initScrollAnimations();
  initStatsCounters();
  initResourceFilters();
  init3DTiltCards();
  initEventsCountdown();
  initGalleryLightbox();
  initFaqAccordions();
  initFormSubmissions();
});

// 1. Preloader Fadeout
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          preloader.style.visibility = 'hidden';
          preloader.style.display = 'none';
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }
      });
    });
    // Fallback if window load is delayed
    setTimeout(() => {
      if (preloader.style.visibility !== 'hidden') {
        preloader.style.opacity = 0;
        preloader.style.visibility = 'hidden';
      }
    }, 4000);
  }
}

// 2. Theme Toggle & Persistence
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Retrieve saved preference or check OS settings
  const savedTheme = localStorage.getItem('theme');
  const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && userPrefersDark)) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.classList.contains('dark');
      if (isDark) {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      } else {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // Mobile Menu Drawer Toggles
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.remove('translate-x-full');
    });
  }

  if (mobileDrawerClose && mobileDrawer) {
    mobileDrawerClose.addEventListener('click', () => {
      mobileDrawer.classList.add('translate-x-full');
    });
  }

  // Close drawer when clicking a link
  const drawerLinks = mobileDrawer ? mobileDrawer.querySelectorAll('a') : [];
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer.classList.add('translate-x-full');
    });
  });
}

// 3. Custom Cursor Interaction
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = document.getElementById('custom-cursor-dot');
  
  if (!cursor || !dot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position dot immediately
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth lag for outer circle
  function updateCursorPosition() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    
    requestAnimationFrame(updateCursorPosition);
  }
  updateCursorPosition();

  // Attach hover triggers
  const hoverables = document.querySelectorAll('a, button, input, select, textarea, .hover-magnify, .gallery-item, .faq-header');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '48px';
      cursor.style.height = '48px';
      cursor.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
      cursor.style.borderColor = '#00E5FF';
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.backgroundColor = 'transparent';
      cursor.style.borderColor = '#00E5FF';
    });
  });
}

// 4. ThreeJS 3D Network Globe
function initThreeJSGlobe() {
  const container = document.getElementById('three-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 250;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Generate Particle Sphere Nodes
  const particleCount = 450;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const radius = 95;

  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Glowing Points Material
  const material = new THREE.PointsMaterial({
    color: 0x00E5FF,
    size: 2.2,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Add floating rings simulating orbital paths
  const ringGeom = new THREE.RingGeometry(110, 111, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x2563EB, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
  const ring1 = new THREE.Mesh(ringGeom, ringMat);
  ring1.rotation.x = Math.PI / 3;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(ringGeom, ringMat);
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.y = Math.PI / 6;
  scene.add(ring2);

  // Mouse coordinate mapping
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseMoveX = 0;
  let mouseMoveY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseMoveX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseMoveY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);

    // Slowly auto-rotate
    particleSystem.rotation.y += 0.002;
    particleSystem.rotation.x += 0.0005;

    ring1.rotation.z -= 0.001;
    ring2.rotation.z += 0.001;

    // Apply mouse shift inertia
    targetRotationY += (mouseMoveX * 0.15 - targetRotationY) * 0.05;
    targetRotationX += (mouseMoveY * 0.15 - targetRotationX) * 0.05;

    particleSystem.rotation.y += targetRotationY * 0.1;
    particleSystem.rotation.x += targetRotationX * 0.1;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// 5. Scroll Animations with GSAP
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;

  // Scroll Progress indicator logic
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    });
  }

  // Fade-up reveals for sections
  const headings = document.querySelectorAll('h2, .glass-panel:not(.saarthi-card):not(.resource-card):not(.gallery-item):not(.faq-item)');
  if (headings.length > 0) {
    gsap.set(headings, { opacity: 0, y: 40 });
    headings.forEach(heading => {
      gsap.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // Stagger entry for SAARTHI Cards
  const cards = document.querySelectorAll('.saarthi-card');
  if (cards.length > 0) {
    gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.15,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#saarthis',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }
}

// 6. Stats Count-Up
function initStatsCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (counters.length === 0) return;

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    
    // ScrollTrigger to trigger counting
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 90%',
      onEnter: () => {
        let count = 0;
        const duration = 1500; // ms
        const stepTime = Math.abs(Math.floor(duration / target));
        
        const timer = setInterval(() => {
          count += 1;
          counter.textContent = count;
          if (count >= target) {
            counter.textContent = target + (target === 100 ? '%' : '');
            clearInterval(timer);
          }
        }, stepTime);
      },
      once: true
    });
  });
}

// 7. Resource Filter & Search
function initResourceFilters() {
  const searchInput = document.getElementById('resource-search');
  const filterBtns = document.querySelectorAll('.resource-filter-btn');
  const cards = document.querySelectorAll('.resource-card');

  if (!searchInput && filterBtns.length === 0) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterResources() {
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      
      const matchesCategory = currentCategory === 'all' || category === currentCategory;
      const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        gsap.to(card, { opacity: 1, scale: 1, duration: 0.3 });
      } else {
        gsap.to(card, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          onComplete: () => { card.style.display = 'none'; }
        });
      }
    });
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterResources();
    });
  }

  // Category filter triggers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Toggle button classes
      filterBtns.forEach(b => {
        b.classList.remove('bg-secondary', 'text-white', 'shadow-md');
        b.classList.add('bg-white/50', 'dark:bg-[#0B0F19]/50', 'text-slate-600', 'dark:text-slate-400');
      });
      btn.classList.add('bg-secondary', 'text-white', 'shadow-md');
      btn.classList.remove('bg-white/50', 'dark:bg-[#0B0F19]/50', 'text-slate-600', 'dark:text-slate-400');

      currentCategory = btn.getAttribute('data-category');
      filterResources();
    });
  });
}

// 8. 3D Tilt Card effect
function init3DTiltCards() {
  const cards = document.querySelectorAll('.saarthi-card');
  
  cards.forEach(card => {
    const inner = card.querySelector('.saarthi-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within the card
      const y = e.clientY - rect.top;  // y coordinate within the card
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation degree (max 10deg)
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

// 9. Events Countdown
function initEventsCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  // Event date: August 15, 2026
  const eventDate = new Date('August 15, 2026 10:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minsEl.textContent = minutes.toString().padStart(2, '0');
    secsEl.textContent = seconds.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// 10. Gallery Lightbox
function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');

  if (items.length === 0 || !lightbox) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const heading = item.querySelector('h4').textContent;
      const subtitle = item.querySelector('span').textContent;

      titleEl.textContent = heading;
      descEl.textContent = `Captured during: ${subtitle}. Supporting institutional NEP awareness campaigns.`;
      
      lightbox.style.display = 'flex';
      gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    });
  });

  function closeLightbox() {
    gsap.to(lightbox, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => { lightbox.style.display = 'none'; }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// 11. FAQ Accordions
function initFaqAccordions() {
  const headers = document.querySelectorAll('.faq-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.faq-content');
      const isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherContent = otherItem.querySelector('.faq-content');
        if (otherContent) otherContent.style.maxHeight = '0px';
      });

      if (!isActive) {
        item.classList.add('active');
        // Slide down height calculation
        content.style.maxHeight = `${content.scrollHeight}px`;
      } else {
        item.classList.remove('active');
        content.style.maxHeight = '0px';
      }
    });
  });
}

// 12. Mock Form submission alerting
function initFormSubmissions() {
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i> Sending...';

      // Simulate network request
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check mr-2"></i> Sent Successfully!';
        submitBtn.classList.remove('btn-primary-glow');
        submitBtn.classList.add('bg-success');
        contactForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('bg-success');
          submitBtn.classList.add('btn-primary-glow');
        }, 3000);
      }, 1500);
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joined!';
      submitBtn.classList.add('bg-success');
      newsletterForm.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join';
        submitBtn.classList.remove('bg-success');
      }, 3000);
    });
  }
}
