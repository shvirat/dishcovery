// DOM Elements
const loginBtns = [];
const loginBtnPrimary = document.getElementById('loginBtn');
const loginBtnDesktop = document.getElementById('loginDesktopBtn');
const loginBtnMobile = document.getElementById('loginMobileBtn');
if (loginBtnPrimary) loginBtns.push(loginBtnPrimary);
if (loginBtnDesktop) loginBtns.push(loginBtnDesktop);
if (loginBtnMobile) loginBtns.push(loginBtnMobile);

const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const userModal = document.getElementById('userModal');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const authCloseBtns = document.querySelectorAll('.auth-close-btn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');
const userModalName = document.getElementById('userModalName');
const userModalEmail = document.getElementById('userModalEmail');

// Debug: log presence of key elements to help diagnose why modal doesn't open
console.log('auth.js loaded. Elements:', {
    loginBtnsCount: loginBtns.length,
    loginModal: !!loginModal,
    signupModal: !!signupModal,
    showSignupLink: !!showSignupLink,
    showLoginLink: !!showLoginLink,
    authCloseBtnsCount: authCloseBtns.length,
    loginForm: !!loginForm,
    signupForm: !!signupForm
});

let currentModal = null;
let authOriginalPadding = null;

// API base — set to backend origin. When frontend runs on a different port (5500)
// we need to call the backend explicitly (on port 5000) so relative fetch() doesn't hit
// the frontend static server.
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://dishcovery-api.vercel.app";


// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Current user state
let currentUser = null;
let signupPrefillData = null;

// Helper: parse JSON response safely (fallback to text) to avoid Unexpected end of JSON input
async function parseJSONSafe(response) {
    try {
        // attempt to parse JSON
        return await response.json();
    } catch (err) {
        // empty body or invalid JSON - try to read text for better error messages
        try {
            const txt = await response.text();
            if (txt) return { message: txt };
        } catch (e) {
            // ignore
        }
        return null;
    }
}

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".toggle-password");
  if (!btn) return;

  const inputId = btn.getAttribute("data-target");
  const input = document.getElementById(inputId);
  const icon = btn.querySelector("i");

  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
    btn.classList.add("active");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
    btn.classList.remove("active");
  }
});


// Show/Hide Modal Functions
function showModal(modal) {
    if (!modal) return;
    
    // Hide all modals first
    const allModals = [loginModal, signupModal, userModal];
    allModals.forEach(m => {
        if (m && m !== modal) {
            hideModal(m);
        }
    });
    
    currentModal = modal;
    
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (authOriginalPadding === null) {
        authOriginalPadding = document.body.style.paddingRight || '';
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
    }
    
    requestAnimationFrame(() => {
        document.body.style.overflow = "hidden";
        modal.classList.add('visible');
        
        // Update user modal content if showing user modal
        if (modal === userModal && currentUser) {
            userModalName.textContent = currentUser.name;
            userModalEmail.textContent = currentUser.email;
            
            // Ensure logout button has event listener
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                // Remove any existing listeners
                const newLogoutBtn = logoutBtn.cloneNode(true);
                logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
                // Add fresh click listener
                newLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    });
}

function hideModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('visible');
    
    // Wait for modal close animation to complete
    setTimeout(() => {
        if (currentModal === modal) {
            document.body.style.overflow = "";
            // Restore previous padding and reset saved value
            document.body.style.paddingRight = authOriginalPadding || '';
            authOriginalPadding = null;
            currentModal = null;
        }
    }, 350); // Match the modal fade-out animation duration
}

// Toggle between Login and Signup
function switchToSignup() {
    hideModal(loginModal);
    showModal(signupModal);
}

function switchToLogin(showSuccessMessage = false) {
    hideModal(signupModal);
    setTimeout(() => {
        showModal(loginModal);
        if (showSuccessMessage) {
            showToast('Your account was created successfully! Please log in.', 'success');
        }
    }, 400); // Wait for the hide animation to finish
}

// Session Management
async function checkSession() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await parseJSONSafe(response);
            if (data && data.user) {
                updateUIForLoggedInUser(data.user);
            }
        } else {
            // If session is invalid, clear it
            localStorage.removeItem('token');
            showToast("Session expired. Please log in again.", "error");
        }
    } catch (error) {
        console.warn('Session check failed:', error);
    }
}

function handleLogout() {
    // Clear the session
    localStorage.removeItem('token');
    currentUser = null;

    // Hide the user modal first
    hideModal(userModal);

    // Reset all login buttons and their event listeners
    const desktopBtn = document.getElementById('loginDesktopBtn');
    const mobileBtn = document.getElementById('loginMobileBtn');
    
    function resetButton(btn) {
        if (btn) {
            btn.textContent = 'Login';
            // Create new button to clear all event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add the login modal event listener
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showModal(loginModal);
            });
        }
    }

    // Reset both buttons
    resetButton(desktopBtn);
    resetButton(mobileBtn);

    // Show success message
    showToast('You\'ve been logged out successfully.', 'success');
}

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(input, message) {
    const formGroup = input.parentElement;
    formGroup.classList.add('error');
    const error = formGroup.querySelector('.form-error');
    error.textContent = message;
}

function clearError(input) {
    const formGroup = input.parentElement;
    formGroup.classList.remove('error');
}

// Form Submission Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]');
    const password = loginForm.querySelector('#loginPassword');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    // Clear previous errors
    clearError(email);
    clearError(password);
    
    // Validate
    let isValid = true;
    
    if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!validatePassword(password.value)) {
        showError(password, 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (isValid) {
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            const parsed = await parseJSONSafe(response);
            if (response.ok) {
                const data = parsed || {};
                if (data.token) localStorage.setItem('token', data.token);
                hideModal(loginModal);
                updateUIForLoggedInUser(data.user || {});
                showToast('Welcome back!', 'success');
                loginForm.reset();
            } else {
                const msg = (parsed && parsed.message) || response.statusText || 'Login failed';
                throw new Error(msg);
            }
        } catch (error) {
            showError(email, error.message || 'Login failed. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    }
}

async function handleSignup(e) {
    // Ensure the event is prevented immediately
    if (e && e.preventDefault) e.preventDefault();
    
    const name = signupForm.querySelector('input[type="text"]');
    const email = signupForm.querySelector('input[type="email"]');
    const password = signupForm.querySelector('#signupPassword');
    const confirmPassword = signupForm.querySelector('#signupConfirmPassword');
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    
    // Clear previous errors
    clearError(name);
    clearError(email);
    clearError(password);
    clearError(confirmPassword);
    
    // Validate
    let isValid = true;
    
    if (!name.value.trim()) {
        showError(name, 'Please enter your name');
        isValid = false;
    }
    
    if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!validatePassword(password.value)) {
        showError(password, 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }
    
    if (isValid) {
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            
            const response = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name.value,
                    email: email.value,
                    password: password.value
                })
            });

            const parsed = await parseJSONSafe(response);
            if (response.ok) {

            // Store values for login autofill
            signupPrefillData = {
                email: email.value,
                // password: password.value
            };

            // Reset form AFTER storing values
            signupForm.reset();
                        
                // Hide signup modal
                hideModal(signupModal);
                
                // Show success message
                showToast('✅ Account created successfully! Please log in.', 'success');
                
                // Wait for the success message to be visible before showing login modal
                setTimeout(() => {
                    showModal(loginModal);

                    // Autofill login form
                    if (signupPrefillData && loginForm) {
                        const loginEmail = loginForm.querySelector('input[type="email"]');
                        const loginPassword = loginForm.querySelector('input[type="password"]');

                        if (loginEmail) {
                            loginEmail.value = signupPrefillData.email;
                            clearError(loginEmail);
                            loginEmail.classList.add('autofilled');
                            setTimeout(() => loginEmail.classList.remove('autofilled'), 1400);

                        }

                        // ⚠ OPTIONAL 
                        // if (loginPassword) {
                        //     loginPassword.value = signupPrefillData.password;
                        //     clearError(loginPassword);
                        // }
                        // redirectTypingToPassword(loginEmail, loginPassword);
                        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            loginPassword.focus();
                        } else {
                            focusAfterAnimation(loginModal, loginPassword);
                        }

                    }

                    // Clear temp data after use
                    signupPrefillData = null;

                }, 500);

                
                // Return false to ensure no form submission
                return false;
            } else {
                const msg = (parsed && parsed.message) || response.statusText || 'Signup failed';
                throw new Error(msg);
            }
        } catch (error) {
            showError(email, error.message || 'Signup failed. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    }
    
    // Return false to prevent form submission
    return false;
}

// Safe focus helper
function focusAfterAnimation(modal, input) {
    if (!modal || !input) return;

    const onAnimationEnd = (e) => {
        if (e.target !== modal) return;
        modal.removeEventListener('animationend', onAnimationEnd);
        input.focus({ preventScroll: true });
    };
    modal.addEventListener('animationend', onAnimationEnd);
}

// Move typing to password field automatically
function redirectTypingToPassword(emailInput, passwordInput) {
    if (!emailInput || !passwordInput) return;

    const handler = (e) => {
        // Ignore control keys
        if (e.key.length > 1) return;

        e.preventDefault();
        passwordInput.focus();
        passwordInput.value += e.key;

        // Remove listener after first redirect
        emailInput.removeEventListener('keydown', handler);
    };

    emailInput.addEventListener('keydown', handler);
}

// UI Update
function updateUIForLoggedInUser(user) {
    currentUser = user;
    
    // Update desktop and mobile buttons separately
    const desktopBtn = document.getElementById('loginDesktopBtn');
    const mobileBtn = document.getElementById('loginMobileBtn');
    
    // function updateButton(btn) {
    //     if (btn) {
    //         // Create new button to clear all previous listeners
    //         const newBtn = btn.cloneNode(true);
    //         newBtn.textContent = `Welcome, ${user.name}`;
    //         btn.parentNode.replaceChild(newBtn, btn);
            
    //         // Add user modal event listener
    //         newBtn.addEventListener('click', (e) => {
    //             e.preventDefault();
    //             showModal(userModal);
    //         });
    //     }
    // }
    
    // Update both buttons
    // updateButton(desktopBtn);
    // updateButton(mobileBtn);

    function updateButton(btn, isMobile = false) {
    if (!btn) return;

    // Clone to remove old listeners
    const newBtn = btn.cloneNode(true);

    if (isMobile) {
        // Mobile: static user icon (SVG)
        newBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" 
                 fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" 
                      stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        newBtn.setAttribute("aria-label", "User menu");
    } else {
        // Desktop: welcome text
        newBtn.textContent = `Welcome, ${user.name.trim().split(/\s+/)[0]}`;
    }

    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showModal(userModal);
    });
    }

    // Apply
    updateButton(desktopBtn, false);
    updateButton(mobileBtn, true);

}

// Close modal when clicking outside
function handleOutsideClick(e) {
    if (e.target.classList.contains('auth-modal-container')) {
        hideModal(e.target);
    }
}

// Initial Event Listeners for login buttons
function initLoginButtons() {
    const desktopBtn = document.getElementById('loginDesktopBtn');
    const mobileBtn = document.getElementById('loginMobileBtn');
    
    function initButton(btn) {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showModal(loginModal);
            });
        }
    }
    
    initButton(desktopBtn);
    initButton(mobileBtn);
    
    if (!desktopBtn && !mobileBtn) {
        console.warn('no login buttons found (expected "loginDesktopBtn" or "loginMobileBtn")');
    }
}

if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToSignup();
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });
}

if (authCloseBtns && authCloseBtns.length) {
    authCloseBtns.forEach(btn => btn.addEventListener('click', () => {
        const modal = btn.closest('.auth-modal-container');
        if (modal) {
            hideModal(modal);
        }
    }));
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
} else {
    console.warn('loginForm not found');
}

if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
} else {
    console.warn('signupForm not found');
}

// Close on outside click
if (loginModal) loginModal.addEventListener('click', handleOutsideClick);
if (signupModal) signupModal.addEventListener('click', handleOutsideClick);
if (userModal) {
    userModal.addEventListener('click', handleOutsideClick);
}

// Add keyboard event listener for ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
        hideModal(currentModal);
    }
});

// Initialize all buttons
function initializeAllButtons() {
    // Initialize login buttons
    initLoginButtons();
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Initialize on script load
initializeAllButtons();

// Check for existing session and reinitialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initializeAllButtons();
});