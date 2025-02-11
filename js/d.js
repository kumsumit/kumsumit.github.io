document.addEventListener('DOMContentLoaded', (event) => {
    const text = document.querySelector('.tag-line');
    text.innerHTML = text.textContent.split('').map((char, i) => {
        // Add a non-breaking space for spaces
        if (char === ' ') {
            return `<span style="animation-delay:${i * 0.1}s;">&nbsp;</span>`;
        }
        return `<span style="animation-delay:${i * 0.1}s;">${char}</span>`;
    }).join('');
});

document.addEventListener('DOMContentLoaded', (event) => {
    const text = document.querySelector('.contact-button');
    text.innerHTML = text.textContent.split('').map((char, i) => `<span style="animation-delay:${i * 0.1}s;">${char}</span>`).join('');
});
