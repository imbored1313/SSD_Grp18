// home.js - ElectraEdge Homepage JavaScript

// Shopping cart functionality
let cart = [];

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadCartFromStorage();
});

// Add item to cart
function addToCart(event, productId, price) {
    // Prevent card click event
    event.stopPropagation();
    
    const productNames = {
        'smartphone': 'ElectraPhone Pro Max',
        'laptop': 'UltraBook Elite X1',
        'headphones': 'SoundWave Pro Wireless',
        'smartwatch': 'TimeSync Smart Watch',
        'tablet': 'TabletPro Ultra 12',
        'speaker': 'BoomBox Smart Speaker'
    };
    
    const productEmojis = {
        'smartphone': '📱',
        'laptop': '💻',
        'headphones': '🎧',
        'smartwatch': '⌚',
        'tablet': '📟',
        'speaker': '🔊'
    };
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productNames[productId],
            emoji: productEmojis[productId],
            price: price,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCartToStorage();
    showNotification(`${productNames[productId]} added to cart!`);
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        updateCartDisplay();
    }
}

// Update cart display in modal
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
        totalAmount.textContent = '$0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
                <div style="font-size: 2rem;">${item.emoji}</div>
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                    <p style="color: #666;">$${item.price.toFixed(2)} each</p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="changeQuantity('${item.id}', -1)" style="background: #f8f9fa; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)" style="background: #f8f9fa; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
                <div style="font-weight: bold; min-width: 80px; text-align: right;">$${itemTotal.toFixed(2)}</div>
                <button onclick="removeFromCart('${item.id}')" style="background: #dc3545; color: white; border: none; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">×</button>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Change item quantity
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
    saveCartToStorage();
    showNotification('Item removed from cart');
}

// View product details
function viewProduct(productId) {
    // For demo purposes, show alert. In real app, would navigate to product detail page
    const productNames = {
        'smartphone': 'ElectraPhone Pro Max',
        'laptop': 'UltraBook Elite X1',
        'headphones': 'SoundWave Pro Wireless',
        'smartwatch': 'TimeSync Smart Watch',
        'tablet': 'TabletPro Ultra 12',
        'speaker': 'BoomBox Smart Speaker'
    };
    
    showNotification(`Viewing ${productNames[productId]} details...`);
    
    // In a real app, you would navigate to product detail page:
    // window.location.href = `product-detail.html?id=${productId}`;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // For demo purposes. In real app, would redirect to checkout page
    showNotification('Redirecting to secure checkout...');
    
    // Simulate checkout process
    setTimeout(() => {
        alert('Checkout functionality will be implemented in the next phase. Please create an account to continue.');
        window.location.href = 'register.html';
    }, 1000);
}

// Newsletter subscription
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('newsletterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail').value.trim();
        
        if (!email) {
            showNotification('Please enter your email address');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address');
            return;
        }
        
        // Simulate API call
        showNotification('Thank you for subscribing to our newsletter!');
        document.getElementById('newsletterEmail').value = '';
    });
});

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        // Note: In Claude.ai artifacts, localStorage is not available
        // This would work in a real browser environment
        // localStorage.setItem('electraedge_cart', JSON.stringify(cart));
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        // Note: In Claude.ai artifacts, localStorage is not available
        // This would work in a real browser environment
        // const savedCart = localStorage.getItem('electraedge_cart');
        // if (savedCart) {
        //     cart = JSON.parse(savedCart);
        //     updateCartCount();
        // }
    } catch (error) {
        console.log('Storage not available in this environment');
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add animation classes to elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe product cards for animation
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Close cart modal on mobile if window is resized
    if (window.innerWidth < 768) {
        const modal = document.getElementById('cartModal');
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    }
});

// Close modal when clicking outside
document.getElementById('cartModal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleCart();
    }
});

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
    // Close cart modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('cartModal');
        if (modal.style.display === 'flex') {
            toggleCart();
        }
    }
});