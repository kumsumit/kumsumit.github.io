document.addEventListener("DOMContentLoaded", (event) => {
  const text = document.querySelector(".tag-line");
  text.innerHTML = text.textContent
    .split("")
    .map((char, i) => {
      // Add a non-breaking space for spaces
      if (char === " ") {
        return `<span style="animation-delay:${i * 0.1}s;">&nbsp;</span>`;
      }
      return `<span style="animation-delay:${i * 0.1}s;">${char}</span>`;
    })
    .join("");
});

document.addEventListener("DOMContentLoaded", (event) => {
  const text = document.querySelector(".contact-button");
  text.innerHTML = text.textContent
    .split("")
    .map(
      (char, i) => `<span style="animation-delay:${i * 0.1}s;">${char}</span>`
    )
    .join("");
});

// Function to check if an element is in the viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Add the 'visible' class to elements when they are in the viewport
function handleScroll() {
  const elements = document.querySelectorAll(".slide-left");
  elements.forEach((el) => {
    if (isElementInViewport(el)) {
      el.classList.add("visible"); // Slide the element in when in view
    }
  });
}

// Listen for scroll events
window.addEventListener("scroll", handleScroll);

// Run on page load to check if any elements are already in view
document.addEventListener("DOMContentLoaded", handleScroll);
