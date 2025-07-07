// js/header.js

document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('header-placeholder');

    fetch('header.html')
        .then(res => res.text())
        .then(data => {
            placeholder.innerHTML = data;
            highlightActiveTab();
            updateCartCount(); // show count from localStorage
        });

    function highlightActiveTab() {
        const currentPath = window.location.pathname.split("/").pop();
        document.querySelectorAll(".nav-menu a").forEach(link => {
            const href = link.getAttribute("href");
            if (currentPath.includes(href)) {
                link.classList.add("active");
            }
        });
    }
});

// Make updateCartCount globally available
function updateCartCount() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCountSpan.textContent = cart.length;
    }
}

// Make the function available globally so other scripts can call it
window.updateCartCount = updateCartCount;