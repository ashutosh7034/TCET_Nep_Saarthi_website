document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initThemeToggle();
  initStatsCounters();
  initResourceFilters();
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
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.visibility = 'hidden';
        preloader.style.display = 'none';
      }, 400);
    });
    // Fallback if window load is delayed
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.visibility = 'hidden';
        preloader.style.display = 'none';
      }, 400);
    }, 2000);
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

  // Scroll Progress indicator logic
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    });
  }
}

// 3. Stats Count-Up using IntersectionObserver (Clean Web API approach)
function initStatsCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (counters.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'), 10);
        let count = 0;
        const duration = 1200; // ms
        const steps = Math.min(target, 50);
        const stepTime = duration / steps;
        const increment = Math.ceil(target / steps);
        
        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            counter.textContent = target + (target === 100 ? '%' : '');
            clearInterval(timer);
          } else {
            counter.textContent = count;
          }
        }, stepTime);

        observerInstance.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach(counter => {
    observer.observe(counter);
  });
}

// 4. Resource Filter & Search (Clean CSS class manipulation)
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
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.97)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
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
      filterBtns.forEach(b => {
        b.classList.remove('bg-accent', 'text-white');
        b.classList.add('border', 'border-neutral-200', 'dark:border-neutral-800', 'text-neutral-600', 'dark:text-neutral-400', 'bg-white', 'dark:bg-neutral-900');
      });
      btn.classList.add('bg-accent', 'text-white');
      btn.classList.remove('border', 'border-neutral-200', 'dark:border-neutral-800', 'text-neutral-600', 'dark:text-neutral-400', 'bg-white', 'dark:bg-neutral-900');

      currentCategory = btn.getAttribute('data-category');
      filterResources();
    });
  });
}

// 5. Events Countdown
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

// 6. Gallery Lightbox
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
      descEl.textContent = `Campaign Event date: ${subtitle}. Supporting institutional NEP awareness campaigns.`;
      
      lightbox.style.display = 'flex';
      setTimeout(() => {
        lightbox.style.opacity = '1';
      }, 10);
    });
  });

  function closeLightbox() {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.style.display = 'none';
    }, 200);
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

// 7. FAQ Accordions
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
        content.style.maxHeight = `${content.scrollHeight}px`;
      } else {
        item.classList.remove('active');
        content.style.maxHeight = '0px';
      }
    });
  });
}

// 8. Form Submissions
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
        submitBtn.classList.remove('bg-accent');
        submitBtn.classList.add('bg-emerald-600');
        contactForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('bg-emerald-600');
          submitBtn.classList.add('bg-accent');
        }, 3000);
      }, 1200);
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joined';
      submitBtn.classList.add('bg-emerald-600');
      newsletterForm.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join';
        submitBtn.classList.remove('bg-emerald-600');
      }, 3000);
    });
  }
}
