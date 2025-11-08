// Theme management
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Theme toggling function
function toggleTheme() {
    // Get current theme or default to dark
    const currentTheme = document.documentElement.dataset.theme || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply theme to HTML element
    document.documentElement.dataset.theme = newTheme;
    
    // Store in localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update both icons
    updateThemeIcons(newTheme);
    
    // Add animation class to the clicked button
    const clickedButton = this;
    clickedButton.classList.add('theme-toggle-animation');
    setTimeout(() => clickedButton.classList.remove('theme-toggle-animation'), 500);
}

// Update theme icons
function updateThemeIcons(theme) {
    const newIconClass = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    const desktopIcon = themeToggle.querySelector('i');
    const mobileIcon = mobileThemeToggle.querySelector('i');
    
    desktopIcon.className = newIconClass;
    mobileIcon.className = newIconClass;
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        updateThemeIcons(savedTheme);
    } else {
        const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = systemTheme;
        updateThemeIcons(systemTheme);
    }
}

// Event listeners
themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

prefersDarkScheme.addListener((e) => {
    if (!localStorage.getItem('theme')) {
        document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
        updateThemeIcons(e.matches ? 'dark' : 'light');
    }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initializeTheme);