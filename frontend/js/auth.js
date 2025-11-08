// DOM Elements
// Collect any login buttons that may exist (desktop/mobile or single `loginBtn`)
const loginBtns = [];
const loginBtnPrimary = document.getElementById('loginBtn');
const loginBtnDesktop = document.getElementById('loginDesktopBtn');
const loginBtnMobile = document.getElementById('loginMobileBtn');
if (loginBtnPrimary) loginBtns.push(loginBtnPrimary);
if (loginBtnDesktop) loginBtns.push(loginBtnDesktop);
if (loginBtnMobile) loginBtns.push(loginBtnMobile);
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const authCloseBtns = document.querySelectorAll('.auth-close-btn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

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
const API_BASE = 'http://localhost:5000';

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

// Show/Hide Modal Functions
function showModal(modal) {
    if (!modal) return;
    currentModal = modal;
    console.log('auth.showModal called; modal:', modal && modal.id);
    
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Only capture and apply padding when no auth modal is currently open
    if (authOriginalPadding === null) {
        authOriginalPadding = document.body.style.paddingRight || window.getComputedStyle(document.body).paddingRight || '';

        // Add padding before changing overflow to prevent layout shift
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
    }
    
    requestAnimationFrame(() => {
        document.body.style.overflow = "hidden";
        modal.classList.add('visible');
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

function switchToLogin() {
    hideModal(signupModal);
    showModal(loginModal);
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
    const password = loginForm.querySelector('input[type="password"]');
    
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
            // TODO: Add your API call here
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
            } else {
                const msg = (parsed && parsed.message) || response.statusText || 'Login failed';
                throw new Error(msg);
            }
        } catch (error) {
            showError(email, error.message || 'Login failed. Please try again.');
        }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = signupForm.querySelector('input[type="text"]');
    const email = signupForm.querySelector('input[type="email"]');
    const password = signupForm.querySelectorAll('input[type="password"]')[0];
    const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1];
    
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
            // TODO: Add your API call here
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
                const data = parsed || {};
                if (data.token) localStorage.setItem('token', data.token);
                hideModal(signupModal);
                updateUIForLoggedInUser(data.user || {});
            } else {
                const msg = (parsed && parsed.message) || response.statusText || 'Signup failed';
                throw new Error(msg);
            }
        } catch (error) {
            showError(email, error.message || 'Signup failed. Please try again.');
        }
    }
}

// UI Update
function updateUIForLoggedInUser(user) {
    // Update any login button labels (desktop/mobile/single)
    try {
        if (loginBtns && loginBtns.length) {
            loginBtns.forEach(btn => {
                if (user && user.name) btn.textContent = user.name;
            });
        } else {
            const primary = document.getElementById('loginBtn');
            if (primary && user && user.name) primary.textContent = user.name;
        }
    } catch (e) {
        console.warn('updateUIForLoggedInUser error', e);
    }
    // Add any other UI updates needed for logged-in state
}

// Close modal when clicking outside
function handleOutsideClick(e) {
    if (e.target.classList.contains('auth-modal-container')) {
        hideModal(e.target);
    }
}

// Event Listeners
if (loginBtns.length) {
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('login button clicked; loginModal element:', loginModal);
            showModal(loginModal);
        });
    });
} else {
    console.warn('no login buttons found (expected id "loginBtn" or desktop/mobile variants)');
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

// Add keyboard event listener for ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
        hideModal(currentModal);
    }
});