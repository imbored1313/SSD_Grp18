// js/cart.js - FIXED version with session manager sync
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== CART PAGE LOADED ===');

    // Debug: Check what session manager thinks initially
    if (window.sessionManager.isLoggedIn()) {
        const user = window.sessionManager.getUser();
        console.log('🟢 Session Manager says user IS logged in:', user);
    } else {
        console.log('🔴 Session Manager says user is NOT logged in');
    }

    // Debug: Check what PHP thinks and sync with session manager
    console.log('🔍 Now checking what PHP thinks...');

    try {
        const sessionCheck = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
        });
        const sessionResult = await sessionCheck.json();
        console.log('🟢 PHP check_session.php says:', sessionResult);

        // SYNC SESSION MANAGER with PHP result
        if (sessionResult.success && sessionResult.user) {
            console.log('🔄 Syncing session manager with PHP session data...');
            window.sessionManager.currentUser = sessionResult.user;
            window.sessionManager.sessionCheckComplete = true;
            console.log('✅ Session manager updated with user:', sessionResult.user.username);
        }

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
                console.log('🎉 SUCCESS: Cart displaying', cartResult.cart.length, 'items!');
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
    console.log('🎨 Displaying cart items:', items);

    const cartContainer = document.getElementById('cart-items') || document.getElementById('cart-summary');
    if (!cartContainer) {
        console.error('❌ Cart container not found!');
        return;
    }

    let cartHTML = '';
    let total = 0;

    items.forEach(item => {
        const price = parseFloat(item.price);
        const quantity = parseInt(item.quantity);
        const itemTotal = price * quantity;
        total += itemTotal;

        // Handle image path
        let imageSrc = '/assets/images/no-image.jpg';
        if (item.image_path) {
            if (item.image_path.startsWith('http') || item.image_path.startsWith('/uploads/')) {
                imageSrc = item.image_path;
            } else {
                imageSrc = '/uploads/products/' + item.image_path;
            }
        }

        cartHTML += `
            <div class="cart-item" data-product-id="${item.product_id}" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; gap: 1rem;">
                <img src="${imageSrc}" alt="${item.name}" 
                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='/assets/images/no-image.jpg'">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333;">${item.name}</h3>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${item.description || 'No description'}</p>
                    <p style="margin: 0.5rem 0 0 0; font-weight: bold; color: #2c5aa0;">$${price.toFixed(2)} × ${quantity}</p>
                    ${item.stock < 10 ? `<p style="margin: 0.25rem 0 0 0; color: #dc3545; font-size: 0.8rem;">Only ${item.stock} left in stock</p>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="updateQuantity(${item.product_id}, ${quantity - 1})" 
                            style="background: #f8f9fa; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;"
                            ${quantity <= 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>−</button>
                    <span style="min-width: 40px; text-align: center; font-weight: bold; font-size: 1.1rem;">${quantity}</span>
                    <button onclick="updateQuantity(${item.product_id}, ${quantity + 1})" 
                            style="background: #f8f9fa; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;"
                            ${quantity >= item.stock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
                </div>
                <div style="font-weight: bold; min-width: 80px; text-align: right; font-size: 1.1rem; color: #2c5aa0;">$${itemTotal.toFixed(2)}</div>
                <button onclick="removeItem(${item.product_id})" 
                        style="background: #dc3545; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 1rem;"
                        title="Remove item">×</button>
            </div>
        `;
    });

    cartHTML += `
        <div class="cart-total" style="padding: 1.5rem; text-align: right; font-size: 1.3rem; font-weight: bold; border-top: 2px solid #2c5aa0; background: #f8f9fa;">
            <div style="color: #666; font-size: 1rem; margin-bottom: 0.5rem;">Total (${items.length} items):</div>
            <div style="color: #2c5aa0;">$${total.toFixed(2)}</div>
        </div>
    `;

    cartContainer.innerHTML = cartHTML;

    console.log('✅ Cart items successfully displayed!');

    // PAYPAL INITIALIZATION - NOW INSIDE THE FUNCTION! ✅
    setTimeout(() => {
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer && total > 0) {
            console.log('🚀 Initializing PayPal with total:', total);
            paypalContainer.style.display = 'block';
            paypalContainer.innerHTML = ''; // Clear existing buttons

            // Set global total for PayPal
            window.total = total;

            paypal.Buttons({
                createOrder: (data, actions) => {
                    return fetch('php/create-order.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: total.toFixed(2) })
                    }).then(res => res.json()).then(data => data.id);
                },
                onApprove: (data, actions) => {
                    return fetch('php/capture-order.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderID: data.orderID })
                    }).then(res => res.json()).then(details => {
                        alert(`Payment complete! Thank you, ${details.payer.name.given_name}.`);
                        window.location.href = 'order_cfm.php';
                    });
                }
            }).render('#paypal-button-container');
        }
    }, 500);
} // ← Function ends here

function displayEmptyCart() {
    console.log('📭 Displaying empty cart');

    const cartContainer = document.getElementById('cart-items') || document.getElementById('cart-summary');
    if (!cartContainer) return;

    cartContainer.innerHTML = `
        <div class="empty-cart" style="text-align: center; padding: 3rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.7;">🛒</div>
            <h3 style="color: #666; margin-bottom: 1rem;">Your cart is empty</h3>
            <p style="color: #888; margin-bottom: 2rem; font-size: 1rem;">Discover our amazing products and start shopping!</p>
            <a href="catalog.html" class="btn btn-primary" style="display: inline-block; background: #2c5aa0; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; transition: background 0.3s;">
                Browse Products
            </a>
        </div>
    `;

    updateCartCount(0);
}

function updateCartCount(count) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
    }

    // Update session manager's count if available
    if (window.sessionManager && typeof window.sessionManager.updateCartCount === 'function') {
        window.sessionManager.updateCartCount(count);
    }
}

async function updateQuantity(productId, newQty) {
    if (newQty < 1) {
        removeItem(productId);
        return;
    }

    console.log(`🔄 Updating quantity for product ${productId} to ${newQty}`);

    try {
        const response = await fetch('php/update_cart.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: parseInt(productId),
                quantity: parseInt(newQty)
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Quantity updated successfully');
            showNotification('Quantity updated!', 'success');
            // Reload cart to get fresh data
            await loadCartFromDB();
        } else {
            console.error('❌ Update failed:', data.message);
            showNotification('Update failed: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('💥 Update quantity error:', error);
        showNotification('Failed to update quantity', 'error');
    }
}

async function removeItem(productId) {
    if (!confirm("Are you sure you want to remove this item from your cart?")) return;

    console.log(`🗑️ Removing product ${productId} from cart`);

    try {
        const response = await fetch('php/delete_cart_item.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: parseInt(productId) })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Item removed successfully');
            showNotification('Item removed from cart!', 'success');
            // Reload cart to get fresh data
            await loadCartFromDB();
        } else {
            console.error('❌ Remove failed:', data.message);
            showNotification('Failed to remove item: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('💥 Remove item error:', error);
        showNotification('Failed to remove item', 'error');
    }
}

// Notification function
function showNotification(message, type = 'success') {
    const existing = document.getElementById('cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'cart-notification';

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}