// js/header.js - FINAL FIXED version with proper cart count

document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('header-placeholder');

    fetch('header.html')
        .then(res => res.text())
        .then(data => {
            placeholder.innerHTML = data;
            highlightActiveTab();
            
            // Update cart count immediately after header loads
            updateCartCount();
            
            // Set up periodic cart count updates
            setupCartCountUpdater();
        })
        .catch(error => {
            console.error('Error loading header:', error);
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

// FIXED: Enhanced cart count function with better error handling
function updateCartCount() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        try {
            // Use the shared cart storage that all pages use
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.length;
            
            cartCountSpan.textContent = count;
            console.log('✅ Cart count updated to:', count);
            
            // Add visual feedback when count changes
            if (count > 0) {
                cartCountSpan.style.background = '#dc3545';
                cartCountSpan.style.color = 'white';
                cartCountSpan.style.display = 'inline-block';
            } else {
                cartCountSpan.style.background = '#6c757d';
                cartCountSpan.style.color = 'white';
                cartCountSpan.style.display = 'inline-block';
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
            cartCountSpan.textContent = '0';
        }
    } else {
        console.log('❌ Cart count element not found');
    }
}

// Set up periodic cart count updates
function setupCartCountUpdater() {
    // Update cart count every 2 seconds to catch changes from other scripts
    setInterval(() => {
        updateCartCount();
    }, 2000);
    
    // Also listen for storage changes (when other tabs modify cart)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            console.log('🔄 Cart storage changed, updating count');
            updateCartCount();
        }
    });
    
    // Listen for custom cart update events
    window.addEventListener('cartUpdated', function() {
        console.log('🔄 Cart updated event received');
        updateCartCount();
    });
}

// Enhanced function to trigger cart updates across the application
function triggerCartUpdate() {
    updateCartCount();
    
    // Dispatch custom event for other parts of the application
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    console.log('✅ Cart update triggered');
}

// Make functions available globally so other scripts can call them
window.updateCartCount = updateCartCount;
window.triggerCartUpdate = triggerCartUpdate;

// FIXED: Add cart count styling
document.addEventListener('DOMContentLoaded', function() {
    // Add styles for cart count badge
    const style = document.createElement('style');
    style.textContent = `
        .cart-count {
            background: #dc3545 !important;
            color: white !important;
            border-radius: 50% !important;
            padding: 0.2rem 0.4rem !important;
            font-size: 0.8rem !important;
            font-weight: bold !important;
            min-width: 1.5rem !important;
            text-align: center !important;
            display: inline-block !important;
            line-height: 1 !important;
            margin-left: 0.25rem !important;
        }
        
        .cart-icon {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            text-decoration: none !important;
            color: white !important;
            font-size: 1.2rem !important;
        }
        
        .cart-icon:hover {
            color: #ffd700 !important;
        }
    `;
    document.head.appendChild(style);
});