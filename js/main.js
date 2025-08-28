// ModelArena - Optimized Main JavaScript

class ModelArena {
  constructor() {
    // Cache DOM elements early
    this.cachedElements = {};
    this.components = {};
    this.isInitialized = false;

    // Use RAF for non-critical initialization
    requestAnimationFrame(() => this.init());
  }

  init() {
    if (this.isInitialized) return;

    this.cacheElements();
    this.initializeComponents();
    this.bindEvents();
    this.setupLazyLoading();
    this.setupAccessibility();

    this.isInitialized = true;
  }

  cacheElements() {
    // Cache frequently used elements
    this.cachedElements = {
      body: document.body,
      header: document.querySelector("header"),
      mobileMenuToggle: document.getElementById("mobile-menu-toggle"),
      mobileNav: document.getElementById("mobile-nav"),
      mobileSearchToggle: document.getElementById("mobile-search-toggle"),
      mobileSearchField: document.getElementById("mobile-search-field"),
      loginModal: document.getElementById("login-modal"),
      signupModal: document.getElementById("signup-modal"),
    };
  }

  initializeComponents() {
    // Only initialize components if their required elements exist
    if (this.cachedElements.mobileMenuToggle && this.cachedElements.mobileNav) {
      this.components.mobileMenu = new MobileMenu(this.cachedElements);
    }

    if (
      this.cachedElements.mobileSearchToggle &&
      this.cachedElements.mobileSearchField
    ) {
      this.components.mobileSearch = new MobileSearch(this.cachedElements);
    }

    if (this.cachedElements.loginModal && this.cachedElements.signupModal) {
      this.components.authModals = new AuthModals(this.cachedElements);
    }

    // Initialize add tag modal
    this.components.addTagModal = new AddTagModal();

    // Initialize other components only if needed
    this.components.searchForm = new SearchForm();
    this.components.favoriteButtons = new FavoriteButtons();
    this.components.imageLoader = new ImageLoader();
  }

  bindEvents() {
    // Use passive listeners for better performance
    const passiveOptions = { passive: true };

    // Debounced resize handler
    this.resizeHandler = this.debounce(() => this.handleResize(), 250);
    window.addEventListener("resize", this.resizeHandler, passiveOptions);

    // Keyboard navigation with early exit
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      // Close components efficiently
      Object.values(this.components).forEach((component) => {
        if (component && typeof component.close === "function") {
          component.close();
        }
      });

      if (this.components.authModals?.closeAll) {
        this.components.authModals.closeAll();
      }
    });

    // Single DOMContentLoaded listener
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => this.setupPageFeatures(),
        { once: true }
      );
    } else {
      this.setupPageFeatures();
    }
  }

  setupPageFeatures() {
    this.setupSmoothScroll();
    this.setupFormValidation();
  }

  setupSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.imageLoader.loadImage(img);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: "50px 0px",
          threshold: 0.01,
        }
      );

      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  setupFormValidation() {
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll("input[required], textarea[required]");

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        this.showValidationError(input, "This field is required");
        isValid = false;
      } else {
        this.clearValidationError(input);
      }
    });

    return isValid;
  }

  showValidationError(input, message) {
    input.classList.add("is-invalid");
    let errorElement = input.parentNode.querySelector(".form-error");

    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "form-error";
      input.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
  }

  clearValidationError(input) {
    input.classList.remove("is-invalid");
    const errorElement = input.parentNode.querySelector(".form-error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  setupAccessibility() {
    // Enhanced focus management
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("using-keyboard");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("using-keyboard");
    });

    // Skip link functionality
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute("href"));
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      });
    }
  }

  handleResize() {
    // Handle responsive behavior efficiently
    if (window.innerWidth >= 768) {
      // Close mobile components efficiently
      this.components.mobileMenu?.close();
      this.components.mobileSearch?.close();
    }
  }

  // Optimized debounce utility
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Optimized Mobile Menu Component
class MobileMenu {
  constructor(cachedElements) {
    this.menuToggle = cachedElements.mobileMenuToggle;
    this.mobileNav = cachedElements.mobileNav;
    this.isOpen = false;
    this.isAnimating = false;

    // Cache classes for better performance
    this.classes = {
      open: ["opacity-100", "scale-100", "pointer-events-auto"],
      closed: ["opacity-0", "scale-95", "pointer-events-none"],
    };

    this.bindEvents();
  }

  bindEvents() {
    // Use event delegation for better performance
    this.menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Single click listener using event delegation
    document.addEventListener("click", (e) => {
      if (!this.isOpen) return;

      const isClickInside =
        this.menuToggle.contains(e.target) ||
        this.mobileNav?.contains(e.target);

      if (!isClickInside) {
        this.close();
      }
    });

    // Use event delegation for nav links
    this.mobileNav?.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isAnimating) return;

    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.isOpen || this.isAnimating) return;

    this.isAnimating = true;
    this.isOpen = true;

    // Batch DOM updates
    requestAnimationFrame(() => {
      this.menuToggle.setAttribute("aria-expanded", "true");

      if (this.mobileNav) {
        this.mobileNav.classList.remove(...this.classes.closed);
        this.mobileNav.classList.add(...this.classes.open);
      }

      // Close mobile search efficiently
      window.modelArena?.components?.mobileSearch?.close();

      this.isAnimating = false;
    });
  }

  close() {
    if (!this.isOpen || this.isAnimating) return;

    this.isAnimating = true;
    this.isOpen = false;

    // Batch DOM updates
    requestAnimationFrame(() => {
      this.menuToggle.setAttribute("aria-expanded", "false");

      if (this.mobileNav) {
        this.mobileNav.classList.remove(...this.classes.open);
        this.mobileNav.classList.add(...this.classes.closed);
      }

      this.isAnimating = false;
    });
  }
}

// Optimized Mobile Search Component
class MobileSearch {
  constructor(cachedElements) {
    this.searchToggle = cachedElements.mobileSearchToggle;
    this.searchField = cachedElements.mobileSearchField;
    this.menuToggle = cachedElements.mobileMenuToggle;
    this.isOpen = false;
    this.searchInput = null;

    this.bindEvents();
  }

  bindEvents() {
    this.searchToggle.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Single optimized click listener
    document.addEventListener("click", (e) => {
      if (!this.isOpen) return;

      const isClickInside =
        this.searchToggle.contains(e.target) ||
        this.searchField?.contains(e.target);

      if (!isClickInside) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;

    // Batch DOM updates
    requestAnimationFrame(() => {
      this.searchField?.classList.remove("hidden");

      // Close mobile menu efficiently
      window.modelArena?.components?.mobileMenu?.close();

      // Cache and focus search input
      if (!this.searchInput) {
        this.searchInput = this.searchField?.querySelector(
          'input[type="search"]'
        );
      }

      // Use RAF for focus to avoid layout thrashing
      requestAnimationFrame(() => {
        this.searchInput?.focus();
      });
    });
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    // Batch DOM updates
    requestAnimationFrame(() => {
      this.searchField?.classList.add("hidden");
      this.menuToggle?.classList.remove("hidden");
    });
  }
}

// Optimized Auth Modals Component
class AuthModals {
  constructor(cachedElements) {
    this.loginModal = cachedElements.loginModal;
    this.signupModal = cachedElements.signupModal;
    this.loginForm = null;
    this.signupForm = null;
    this.passwordToggles = new Map();

    // Cache modal elements
    this.modalElements = new Map();

    this.bindEvents();
    this.setupPasswordToggles();
  }

  bindEvents() {
    // Single optimized click handler using event delegation
    document.addEventListener("click", (e) => {
      const target = e.target;
      const targetId = target.id;
      const buttonText =
        target.tagName === "BUTTON" ? target.textContent.trim() : "";

      // Handle auth buttons
      if (buttonText === "Log in") {
        e.preventDefault();
        this.openLogin();
        return;
      }

      if (buttonText === "Register") {
        e.preventDefault();
        this.openSignup();
        return;
      }

      // Handle modal controls
      switch (targetId) {
        case "login-modal-close":
          this.closeLogin();
          break;
        case "signup-modal-close":
          this.closeSignup();
          break;
        case "open-signup-modal":
          this.switchToSignup();
          break;
        case "open-login-modal":
          this.switchToLogin();
          break;
      }

      // Handle backdrop clicks
      if (target === this.loginModal) {
        this.closeLogin();
      } else if (target === this.signupModal) {
        this.closeSignup();
      }
    });

    // Optimized form submission handlers
    document.addEventListener("submit", (e) => {
      const formId = e.target.id;

      if (formId === "login-form") {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (formId === "signup-form") {
        e.preventDefault();
        this.handleSignup(e.target);
      }
    });
  }

  switchToSignup() {
    this.closeLogin();
    requestAnimationFrame(() => this.openSignup());
  }

  switchToLogin() {
    this.closeSignup();
    requestAnimationFrame(() => this.openLogin());
  }

  setupPasswordToggles() {
    // Login password toggle
    const loginPasswordToggle = document.getElementById(
      "login-password-toggle"
    );
    const loginPasswordInput = document.getElementById("login-password");

    loginPasswordToggle?.addEventListener("click", () => {
      this.togglePasswordVisibility(loginPasswordInput, loginPasswordToggle);
    });

    // Signup password toggles
    const signupPasswordToggle = document.getElementById(
      "signup-password-toggle"
    );
    const signupPasswordInput = document.getElementById("signup-password");

    signupPasswordToggle?.addEventListener("click", () => {
      this.togglePasswordVisibility(signupPasswordInput, signupPasswordToggle);
    });

    const signupConfirmToggle = document.getElementById(
      "signup-confirm-password-toggle"
    );
    const signupConfirmInput = document.getElementById(
      "signup-confirm-password"
    );

    signupConfirmToggle?.addEventListener("click", () => {
      this.togglePasswordVisibility(signupConfirmInput, signupConfirmToggle);
    });
  }

  togglePasswordVisibility(input, toggle) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    // Update icon (you can customize this based on your icon preference)
    const svg = toggle.querySelector("svg");
    if (isPassword) {
      // Show eye-slash icon when password is visible
      svg.innerHTML =
        '<path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"/>';
    } else {
      // Show eye icon when password is hidden
      svg.innerHTML =
        '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
    }
  }

  openLogin() {
    this.closeSignup();

    if (!this.loginModal) return;

    // Batch DOM updates
    requestAnimationFrame(() => {
      this.loginModal.classList.remove("hidden");
      this.loginModal.classList.add("flex");
      document.body.style.overflow = "hidden";

      // Cache and focus first input
      if (!this.modalElements.has("loginFirstInput")) {
        this.modalElements.set(
          "loginFirstInput",
          this.loginModal.querySelector("input")
        );
      }

      requestAnimationFrame(() => {
        this.modalElements.get("loginFirstInput")?.focus();
      });
    });
  }

  closeLogin() {
    if (!this.loginModal) return;

    requestAnimationFrame(() => {
      this.loginModal.classList.remove("flex");
      this.loginModal.classList.add("hidden");
      document.body.style.overflow = "";
    });
  }

  openSignup() {
    this.closeLogin();

    if (!this.signupModal) return;

    // Batch DOM updates
    requestAnimationFrame(() => {
      this.signupModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";

      // Cache and focus first input
      if (!this.modalElements.has("signupFirstInput")) {
        this.modalElements.set(
          "signupFirstInput",
          this.signupModal.querySelector("input")
        );
      }

      requestAnimationFrame(() => {
        this.modalElements.get("signupFirstInput")?.focus();
      });
    });
  }

  closeSignup() {
    if (!this.signupModal) return;

    requestAnimationFrame(() => {
      this.signupModal.classList.add("hidden");
      document.body.style.overflow = "";
    });
  }

  closeAll() {
    this.closeLogin();
    this.closeSignup();
    // Also close add tag modal if it exists
    window.modelArena?.components?.addTagModal?.close();
  }

  handleLogin(form) {
    // Get form data efficiently
    const formData = new FormData(form);
    const loginData = {
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      remember: Boolean(formData.get("remember")),
    };

    // Basic validation
    if (!loginData.email || !loginData.password) {
      this.showError("Please fill in all required fields");
      return;
    }

    console.log("Login attempt:", loginData);

    // Here you would typically send the data to your backend
    // For now, just show a success message
    this.showSuccess("Login functionality would be implemented here");

    // Close modal on successful login
    // this.closeLogin();
  }

  handleSignup(form) {
    // Get form data efficiently
    const formData = new FormData(form);
    const signupData = {
      fullName: formData.get("fullName")?.trim(),
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: Boolean(formData.get("terms")),
    };

    // Comprehensive validation
    if (!signupData.fullName || !signupData.email || !signupData.password) {
      this.showError("Please fill in all required fields");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      this.showError("Passwords do not match");
      return;
    }

    if (!signupData.terms) {
      this.showError("Please agree to the Terms & Conditions");
      return;
    }

    console.log("Signup attempt:", signupData);

    // Here you would typically send the data to your backend
    // For now, just show a success message
    this.showSuccess("Signup functionality would be implemented here");

    // Close modal on successful signup
    // this.closeSignup();
  }

  showError(message) {
    // Use modern notification instead of alert
    console.error(message);
    // Could implement toast notification here
  }

  showSuccess(message) {
    // Use modern notification instead of alert
    console.log(message);
    // Could implement toast notification here
  }
}

// Add Tag Modal Component
class AddTagModal {
  constructor() {
    this.modal = document.getElementById("add-tag-modal");
    this.addTagBtn = document.getElementById("add-tag-btn");
    this.closeBtn = document.getElementById("close-add-tag-modal");
    this.confirmBtn = document.getElementById("confirm-add-tag");
    this.tagInput = document.getElementById("tag-input");
    this.isOpen = false;

    if (this.modal && this.addTagBtn) {
      this.bindEvents();
    }
  }

  bindEvents() {
    // Open modal
    this.addTagBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      this.open();
    });

    // Close modal
    this.closeBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      this.close();
    });

    // Confirm button
    this.confirmBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleConfirm();
    });

    // Close on backdrop click
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    // Handle enter key in input
    this.tagInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleConfirm();
      }
    });
  }

  open() {
    if (this.isOpen || !this.modal) return;

    this.isOpen = true;

    requestAnimationFrame(() => {
      this.modal.classList.remove("hidden");
      this.modal.classList.add("flex");
      document.body.style.overflow = "hidden";

      // Focus input
      requestAnimationFrame(() => {
        this.tagInput?.focus();
      });
    });
  }

  close() {
    if (!this.isOpen || !this.modal) return;

    this.isOpen = false;

    requestAnimationFrame(() => {
      this.modal.classList.remove("flex");
      this.modal.classList.add("hidden");
      document.body.style.overflow = "";

      // Clear input
      if (this.tagInput) {
        this.tagInput.value = "";
      }
    });
  }

  handleConfirm() {
    const tagValue = this.tagInput?.value.trim();
    
    if (!tagValue) {
      this.showError("Please enter a tag");
      return;
    }

    // Format tag with # if not present
    const formattedTag = tagValue.startsWith("#") ? tagValue : `#${tagValue}`;
    
    console.log("Adding tag:", formattedTag);
    
    // Here you would typically send the tag to your backend
    // For now, just show a success message and close the modal
    this.showSuccess(`Tag "${formattedTag}" added successfully`);
    this.close();
  }

  showError(message) {
    console.error(message);
    // Could implement toast notification here
  }

  showSuccess(message) {
    console.log(message);
    // Could implement toast notification here
  }
}

// Search Form Component
class SearchForm {
  constructor() {
    this.searchForm = document.querySelector(".search-form");
    this.searchInput = document.querySelector(".search-form__input");
    this.searchButton = document.querySelector(".search-form__button");

    if (this.searchForm) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSearch();
    });

    this.searchInput.addEventListener("input", () => {
      this.handleSearchInput();
    });

    // Clear search on escape
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearSearch();
      }
    });
  }

  handleSearch() {
    const query = this.searchInput.value.trim();
    if (query) {
      // Implement search functionality
      console.log("Searching for:", query);
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
    console.log("Showing results for:", query);
  }

  showSuggestions(query) {
    // Implement search suggestions
    console.log("Showing suggestions for:", query);
  }

  hideSuggestions() {
    // Hide search suggestions
  }

  clearSearch() {
    this.searchInput.value = "";
    this.hideSuggestions();
    this.searchInput.blur();
  }
}

// Favorite Buttons Component
class FavoriteButtons {
  constructor() {
    this.favoriteButtons = document.querySelectorAll(".favorite-btn");
    this.favorites = this.loadFavorites();

    if (this.favoriteButtons.length > 0) {
      this.bindEvents();
      this.updateButtonStates();
    }
  }

  bindEvents() {
    this.favoriteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleFavorite(button);
      });
    });
  }

  toggleFavorite(button) {
    const modelCard = button.closest(".model-card");
    const modelId =
      modelCard?.dataset.modelId || Math.random().toString(36).substr(2, 9);

    if (this.favorites.includes(modelId)) {
      this.removeFavorite(modelId);
      button.classList.remove("is-active");
      this.showToast("Removed from favorites");
    } else {
      this.addFavorite(modelId);
      button.classList.add("is-active");
      this.showToast("Added to favorites");
    }

    // Add animation
    button.style.transform = "scale(1.2)";
    setTimeout(() => {
      button.style.transform = "";
    }, 150);
  }

  addFavorite(modelId) {
    this.favorites.push(modelId);
    this.saveFavorites();
  }

  removeFavorite(modelId) {
    this.favorites = this.favorites.filter((id) => id !== modelId);
    this.saveFavorites();
  }

  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem("modelArenaFavorites") || "[]");
    } catch {
      return [];
    }
  }

  saveFavorites() {
    localStorage.setItem("modelArenaFavorites", JSON.stringify(this.favorites));
  }

  updateButtonStates() {
    this.favoriteButtons.forEach((button) => {
      const modelCard = button.closest(".model-card");
      const modelId = modelCard?.dataset.modelId;

      if (modelId && this.favorites.includes(modelId)) {
        button.classList.add("is-active");
      }
    });
  }

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement("div");
    toast.className = "toast";
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
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
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
      img.classList.add("loaded");
      this.loadedImages.add(img.src);
    };

    tempImg.onerror = () => {
      img.classList.add("error");
      // Set a placeholder image
      img.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjEyNSIgeT0iMTc1IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNFMEUwRTAiLz4KPC9zdmc+";
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
    window.addEventListener("load", () => {
      if ("performance" in window) {
        const perfData = performance.getEntriesByType("navigation")[0];
        console.log(
          "Page load time:",
          perfData.loadEventEnd - perfData.loadEventStart,
          "ms"
        );
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
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  },
};

// Optimized initialization
(() => {
  "use strict";

  // Initialize when DOM is ready or immediately if already loaded
  const init = () => {
    window.modelArena = new ModelArena();
    new PerformanceMonitor();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    // DOM is already loaded, initialize immediately
    requestAnimationFrame(init);
  }
})();

// Service Worker registration for PWA capabilities (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
