// ModelArena - Main JavaScript

class ModelArena {
  constructor() {
    this.init();
  }

  init() {
    this.initializeComponents();
    this.bindEvents();
    this.setupLazyLoading();
    this.setupAccessibility();
  }

  initializeComponents() {
    this.mobileMenu = new MobileMenu();
    this.mobileSearch = new MobileSearch();
    this.authModals = new AuthModals();
    this.searchForm = new SearchForm();
    this.favoriteButtons = new FavoriteButtons();
    this.imageLoader = new ImageLoader();
  }

  bindEvents() {
    // Global event listeners
    document.addEventListener('DOMContentLoaded', () => {
      this.setupSmoothScroll();
      this.setupFormValidation();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.mobileMenu.close();
        this.mobileSearch.close();
        this.authModals.closeAll();
      }
    });

    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  setupSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.imageLoader.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.showValidationError(input, 'This field is required');
        isValid = false;
      } else {
        this.clearValidationError(input);
      }
    });

    return isValid;
  }

  showValidationError(input, message) {
    input.classList.add('is-invalid');
    let errorElement = input.parentNode.querySelector('.form-error');
    
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'form-error';
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearValidationError(input) {
    input.classList.remove('is-invalid');
    const errorElement = input.parentNode.querySelector('.form-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  setupAccessibility() {
    // Enhanced focus management
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });

    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      });
    }
  }

  handleResize() {
    // Handle responsive behavior
    if (window.innerWidth >= 768) {
      this.mobileMenu.close();
      this.mobileSearch.close();
    }
  }
}

// Mobile Menu Component
class MobileMenu {
  constructor() {
    this.menuToggle = document.getElementById('mobile-menu-toggle');
    this.mobileNav = document.getElementById('mobile-nav');
    this.header = document.querySelector('header');
    this.isOpen = false;
    
    if (this.menuToggle) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.menuToggle.addEventListener('click', () => {
      this.toggle();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menuToggle.contains(e.target) && !this.mobileNav?.contains(e.target)) {
        this.close();
      }
    });

    // Close menu on navigation link click
    if (this.mobileNav) {
      this.mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          this.close();
        });
      });
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.menuToggle.setAttribute('aria-expanded', 'true');
    this.mobileNav?.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    this.mobileNav?.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    
    // Close mobile search if open
    const searchField = document.getElementById('mobile-search-field');
    if (searchField && !searchField.classList.contains('hidden')) {
      const mobileSearch = window.modelArena?.mobileSearch;
      if (mobileSearch) {
        mobileSearch.close();
      }
    }
  }

  close() {
    this.isOpen = false;
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.mobileNav?.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
    this.mobileNav?.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
  }
}

// Mobile Search Component
class MobileSearch {
  constructor() {
    this.searchToggle = document.getElementById('mobile-search-toggle');
    this.searchField = document.getElementById('mobile-search-field');
    this.menuToggle = document.getElementById('mobile-menu-toggle');
    this.isOpen = false;
    
    if (this.searchToggle) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.searchToggle.addEventListener('click', () => {
      this.toggle();
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.searchToggle.contains(e.target) && !this.searchField?.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.searchField?.classList.remove('hidden');
    // this.menuToggle?.classList.add('hidden');
    
    // Close mobile menu if open
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && mobileNav.classList.contains('opacity-100')) {
      const mobileMenu = window.modelArena?.mobileMenu;
      if (mobileMenu) {
        mobileMenu.close();
      }
    }
    
    // Focus the search input
    const searchInput = this.searchField?.querySelector('input[type="search"]');
    setTimeout(() => {
      searchInput?.focus();
    }, 100);
  }

  close() {
    this.isOpen = false;
    this.searchField?.classList.add('hidden');
    this.menuToggle?.classList.remove('hidden');
  }
}

// Auth Modals Component
class AuthModals {
  constructor() {
    this.loginModal = document.getElementById('login-modal');
    this.signupModal = document.getElementById('signup-modal');
    this.loginForm = document.getElementById('login-form');
    this.signupForm = document.getElementById('signup-form');
    
    this.bindEvents();
    this.setupPasswordToggles();
  }

  bindEvents() {
    // Use event delegation to handle all auth buttons
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Check if clicked element is a button with login or register text
      if (target.tagName === 'BUTTON') {
        const buttonText = target.textContent.trim();
        
        if (buttonText === 'Log in') {
          e.preventDefault();
          this.openLogin();
          return;
        }
        
        if (buttonText === 'Register') {
          e.preventDefault();
          this.openSignup();
          return;
        }
      }
    });

    // Modal close buttons
    document.getElementById('login-modal-close')?.addEventListener('click', () => {
      this.closeLogin();
    });
    
    document.getElementById('signup-modal-close')?.addEventListener('click', () => {
      this.closeSignup();
    });

    // Switch between modals
    document.getElementById('open-signup-modal')?.addEventListener('click', () => {
      this.closeLogin();
      this.openSignup();
    });
    
    document.getElementById('open-login-modal')?.addEventListener('click', () => {
      this.closeSignup();
      this.openLogin();
    });

    // Close modal when clicking backdrop
    this.loginModal?.addEventListener('click', (e) => {
      if (e.target === this.loginModal) {
        this.closeLogin();
      }
    });
    
    this.signupModal?.addEventListener('click', (e) => {
      if (e.target === this.signupModal) {
        this.closeSignup();
      }
    });

    // Form submissions
    this.loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    
    this.signupForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });
  }

  setupPasswordToggles() {
    // Login password toggle
    const loginPasswordToggle = document.getElementById('login-password-toggle');
    const loginPasswordInput = document.getElementById('login-password');
    
    loginPasswordToggle?.addEventListener('click', () => {
      this.togglePasswordVisibility(loginPasswordInput, loginPasswordToggle);
    });

    // Signup password toggles
    const signupPasswordToggle = document.getElementById('signup-password-toggle');
    const signupPasswordInput = document.getElementById('signup-password');
    
    signupPasswordToggle?.addEventListener('click', () => {
      this.togglePasswordVisibility(signupPasswordInput, signupPasswordToggle);
    });

    const signupConfirmToggle = document.getElementById('signup-confirm-password-toggle');
    const signupConfirmInput = document.getElementById('signup-confirm-password');
    
    signupConfirmToggle?.addEventListener('click', () => {
      this.togglePasswordVisibility(signupConfirmInput, signupConfirmToggle);
    });
  }

  togglePasswordVisibility(input, toggle) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    // Update icon (you can customize this based on your icon preference)
    const svg = toggle.querySelector('svg');
    if (isPassword) {
      // Show eye-slash icon when password is visible
      svg.innerHTML = '<path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"/>';
    } else {
      // Show eye icon when password is hidden
      svg.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
    }
  }

  openLogin() {
    this.closeSignup(); // Close signup if open
    this.loginModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      const firstInput = this.loginModal?.querySelector('input');
      firstInput?.focus();
    }, 100);
  }

  closeLogin() {
    this.loginModal?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openSignup() {
    this.closeLogin(); // Close login if open
    this.signupModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      const firstInput = this.signupModal?.querySelector('input');
      firstInput?.focus();
    }, 100);
  }

  closeSignup() {
    this.signupModal?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  closeAll() {
    this.closeLogin();
    this.closeSignup();
  }

  handleLogin() {
    // Get form data
    const formData = new FormData(this.loginForm);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember')
    };

    console.log('Login attempt:', loginData);
    
    // Here you would typically send the data to your backend
    // For now, just show a success message
    alert('Login functionality would be implemented here');
    
    // Close modal on successful login
    // this.closeLogin();
  }

  handleSignup() {
    // Get form data
    const formData = new FormData(this.signupForm);
    const signupData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      terms: formData.get('terms')
    };

    // Basic validation
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!signupData.terms) {
      alert('Please agree to the Terms & Conditions');
      return;
    }

    console.log('Signup attempt:', signupData);
    
    // Here you would typically send the data to your backend
    // For now, just show a success message
    alert('Signup functionality would be implemented here');
    
    // Close modal on successful signup
    // this.closeSignup();
  }
}

// Search Form Component
class SearchForm {
  constructor() {
    this.searchForm = document.querySelector('.search-form');
    this.searchInput = document.querySelector('.search-form__input');
    this.searchButton = document.querySelector('.search-form__button');
    
    if (this.searchForm) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSearch();
    });

    this.searchInput.addEventListener('input', () => {
      this.handleSearchInput();
    });

    // Clear search on escape
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  }

  handleSearch() {
    const query = this.searchInput.value.trim();
    if (query) {
      // Implement search functionality
      console.log('Searching for:', query);
      // You would typically send this to your backend or filter results
      this.showSearchResults(query);
    }
  }

  handleSearchInput() {
    const query = this.searchInput.value.trim();
    // Implement real-time search suggestions if needed
    if (query.length > 2) {
      // Show search suggestions
      this.showSuggestions(query);
    } else {
      this.hideSuggestions();
    }
  }

  showSearchResults(query) {
    // Implement search results display
    // This would typically involve filtering the model cards or navigating to a search results page
    console.log('Showing results for:', query);
  }

  showSuggestions(query) {
    // Implement search suggestions
    console.log('Showing suggestions for:', query);
  }

  hideSuggestions() {
    // Hide search suggestions
  }

  clearSearch() {
    this.searchInput.value = '';
    this.hideSuggestions();
    this.searchInput.blur();
  }
}

// Favorite Buttons Component
class FavoriteButtons {
  constructor() {
    this.favoriteButtons = document.querySelectorAll('.favorite-btn');
    this.favorites = this.loadFavorites();
    
    if (this.favoriteButtons.length > 0) {
      this.bindEvents();
      this.updateButtonStates();
    }
  }

  bindEvents() {
    this.favoriteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleFavorite(button);
      });
    });
  }

  toggleFavorite(button) {
    const modelCard = button.closest('.model-card');
    const modelId = modelCard?.dataset.modelId || Math.random().toString(36).substr(2, 9);
    
    if (this.favorites.includes(modelId)) {
      this.removeFavorite(modelId);
      button.classList.remove('is-active');
      this.showToast('Removed from favorites');
    } else {
      this.addFavorite(modelId);
      button.classList.add('is-active');
      this.showToast('Added to favorites');
    }

    // Add animation
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }

  addFavorite(modelId) {
    this.favorites.push(modelId);
    this.saveFavorites();
  }

  removeFavorite(modelId) {
    this.favorites = this.favorites.filter(id => id !== modelId);
    this.saveFavorites();
  }

  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('modelArenaFavorites') || '[]');
    } catch {
      return [];
    }
  }

  saveFavorites() {
    localStorage.setItem('modelArenaFavorites', JSON.stringify(this.favorites));
  }

  updateButtonStates() {
    this.favoriteButtons.forEach(button => {
      const modelCard = button.closest('.model-card');
      const modelId = modelCard?.dataset.modelId;
      
      if (modelId && this.favorites.includes(modelId)) {
        button.classList.add('is-active');
      }
    });
  }

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-gray-900);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Image Loader Component
class ImageLoader {
  constructor() {
    this.loadedImages = new Set();
  }

  loadImage(img) {
    if (this.loadedImages.has(img.src)) {
      return;
    }

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = tempImg.src;
      img.classList.add('loaded');
      this.loadedImages.add(img.src);
    };

    tempImg.onerror = () => {
      img.classList.add('error');
      // Set a placeholder image
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjEyNSIgeT0iMTc1IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNFMEUwRTAiLz4KPC9zdmc+';
    };

    tempImg.src = img.dataset.src || img.src;
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.measurePageLoad();
  }

  measurePageLoad() {
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
      }
    });
  }
}

// Utility functions
const utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.modelArena = new ModelArena();
  new PerformanceMonitor();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
