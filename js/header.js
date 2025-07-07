// js/header.js

document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('header-placeholder');

    fetch('header.html')
        .then(res => res.text())
        .then(data => {
            placeholder.innerHTML = data;

            highlightActiveTab();
            if (typeof checkUserSession === 'function') {
                checkUserSession();
            }
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
