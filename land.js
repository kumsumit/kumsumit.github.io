// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const toggleIcon = document.getElementById('toggle-icon');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night');
    document.body.classList.toggle('day');
    themeToggle.classList.toggle('night');
    themeToggle.classList.toggle('day');
    
    // Change icon based on theme
    if (document.body.classList.contains('night')) {
        toggleIcon.textContent = '🌙';
    } else {
        toggleIcon.textContent = '🌞';
    }
});

// Countdown Timer (if needed)
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
