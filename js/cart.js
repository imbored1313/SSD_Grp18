// js/cart.js - DEBUG version to find session mismatch
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== CART PAGE LOADED ===');
    
    // Debug: Check what session manager thinks
    if (window.sessionManager.isLoggedIn()) {
        const user = window.sessionManager.getUser();
        console.log('🟢 Session Manager says user IS logged in:', user);
    } else {
        console.log('🔴 Session Manager says user is NOT logged in');
    }

    // Debug: Check what PHP thinks
    console.log('🔍 Now checking what PHP thinks...');
    
    try {
        const sessionCheck = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
        });
        const sessionResult = await sessionCheck.json();
        console.log('🟢 PHP check_session.php says:', sessionResult);
    } catch (error) {
        console.log('🔴 Error checking PHP session:', error);
    }

    // Debug: Try to load cart and see what get_cart.php says
    console.log('🔍 Now trying to load cart...');
    
    try {
        const cartResponse = await fetch('php/get_cart.php', {
            method: 'GET',
            credentials: 'include'
        });
        const cartResult = await cartResponse.json();
        console.log('🟢 PHP get_cart.php says:', cartResult);
        
        if (cartResult.success) {
            if (cartResult.cart.length === 0) {
                displayEmptyCart();
            } else {
                displayCartItems(cartResult.cart);
            }
            updateCartCount(cartResult.cartCount || 0);
        } else {
            console.log('🔴 Cart load failed:', cartResult.message);
            console.log('🔍 This means get_cart.php cannot find session data');
            displayEmptyCart();
            updateCartCount(0);
        }
    } catch (error) {
        console.error("🔴 Cart load error:", error);
        displayEmptyCart();
    }
});

function loadCartFromDB() {
    console.log('Loading cart from database...');

    fetch('php/get_cart.php', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.cart.length === 0) {
                    displayEmptyCart();
                } else {
                    displayCartItems(data.cart);
                }
                updateCartCount(data.cartCount || 0);
            } else {
                console.error('Failed to load cart:', data.message);
                displayEmptyCart();
                updateCartCount(0);
            }
        })
        .catch(err => {
            console.error("Cart load error:", err);
            displayEmptyCart();
        });
}

function displayCartItems(items) {
    console.log('Displaying cart items:', items);

    // This function is overridden in cart.html for PayPal integration
    // Default implementation for other pages
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    let cartHTML = '';
    let total = 0;

    items.forEach(item => {
        const price = parseFloat(item.price);
        const quantity = parseInt(item.quantity);
        const itemTotal = price * quantity;
        total += itemTotal;

        cartHTML += `
            <div class="cart-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; gap: 1rem;">
                <img src="${item.image_path}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0;">${item.name}</h3>
                    <p style="margin: 0; color: #666;">${item.description}</p>
                    <p style="margin: 0.5rem 0 0 0; font-weight: bold;">$${price.toFixed(2)} × ${quantity}</p>
                </div>
                <div style="text-align: center;">
                    <button onclick="updateQuantity(${item.product_id}, ${quantity - 1})" 
                            style="background: #f8f9fa; border: 1px solid #ddd; padding: 0.25rem 0.5rem; margin: 0 0.25rem;">-</button>
                    <span style="margin: 0 0.5rem;">${quantity}</span>
                    <button onclick="updateQuantity(${item.product_id}, ${quantity + 1})" 
                            style="background: #f8f9fa; border: 1px solid #ddd; padding: 0.25rem 0.5rem; margin: 0 0.25rem;">+</button>
                </div>
                <div style="font-weight: bold; min-width: 80px; text-align: right;">$${itemTotal.toFixed(2)}</div>
                <button onclick="removeItem(${item.product_id})" 
                        style="background: #dc3545; color: white; border: none; padding: 0.5rem; border-radius: 4px;">×</button>
            </div>
        `;
    });

    cartHTML += `
        <div style="padding: 1rem; text-align: right; font-size: 1.2rem; font-weight: bold; border-top: 2px solid #333;">
            Total: $${total.toFixed(2)}
        </div>
    `;

    cartContainer.innerHTML = cartHTML;
}

function displayEmptyCart() {
    console.log('Displaying empty cart');

    // This function is overridden in cart.html
    const cartContainer = document.getElementById('cart-items') || document.getElementById('cart-summary');
    if (!cartContainer) return;

    cartContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
            <h3>Your cart is empty</h3>
            <p style="color: #666; margin-bottom: 2rem;">Start shopping to add items to your cart!</p>
            <a href="catalog.html" class="btn btn-primary">Browse Products</a>
        </div>
    `;

    updateCartCount(0);
}

function updateCartCount(count) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
    }

    // Update global cart manager if it exists
    if (window.cartManager && window.cartManager.updateCount) {
        window.cartManager.updateCount(count);
    }
}

function updateQuantity(productId, newQty) {
    if (newQty < 1) {
        removeItem(productId);
        return;
    }

    fetch('php/update_cart.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: newQty })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadCartFromDB(); // Refresh cart
            } else {
                alert("Update failed: " + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Update quantity error:', err);
            alert("Failed to update quantity");
        });
}

function removeItem(productId) {
    if (!confirm("Remove this item from cart?")) return;

    fetch('php/delete_cart_item.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadCartFromDB(); // Refresh cart
            } else {
                alert("Failed to remove item: " + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Remove item error:', err);
            alert("Failed to remove item");
        });
}