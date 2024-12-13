// Countdown Timer
const countdown = document.getElementById('countdown');
const launchDate = new Date('Dec 31, 2024 00:00:00').getTime();

const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = launchDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (distance < 0) {
        clearInterval(interval);
        countdown.innerHTML = "We're live!";
    }
}, 1000);

document.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('theme-toggle');
    themeToggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        saveThemePreference();
    });

    function saveThemePreference() {
        const isDarkMode = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    loadThemePreference();
});
