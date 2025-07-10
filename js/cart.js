// js/cart.js - SECURE VERSION - XSS vulnerabilities fixed
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
                displayCartItemsSecurely(cartResult.cart);
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
                    displayCartItemsSecurely(data.cart);
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

// SECURITY FIX: Secure cart display function using DOM creation
function displayCartItemsSecurely(items) {
    console.log('🎨 Displaying cart items securely:', items);

    const cartContainer = document.getElementById('cart-items') || document.getElementById('cart-summary');
    if (!cartContainer) {
        console.error('❌ Cart container not found!');
        return;
    }

    // Clear existing content safely
    cartContainer.innerHTML = '';

    let total = 0;

    // Create cart items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'cart-items-container';

    items.forEach(item => {
        const price = parseFloat(item.price);
        const quantity = parseInt(item.quantity);
        const itemTotal = price * quantity;
        total += itemTotal;

        const cartItem = createSecureCartItem(item, price, quantity, itemTotal);
        itemsContainer.appendChild(cartItem);
    });

    // Create cart total section
    const totalSection = createCartTotalSection(items.length, total);
    
    cartContainer.appendChild(itemsContainer);
    cartContainer.appendChild(totalSection);

    console.log('✅ Cart items successfully displayed securely!');

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
                        window.location.href = 'my_orders.html';
                    });
                }
            }).render('#paypal-button-container');
        }
    }, 500);
}

// SECURITY FIX: Create cart item using DOM methods
function createSecureCartItem(item, price, quantity, itemTotal) {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
    cartItemDiv.dataset.productId = item.product_id;
    cartItemDiv.style.cssText = 'display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; gap: 1rem;';

    // Product image
    const img = document.createElement('img');
    img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 8px;';
    img.alt = 'Product image';
    
    // Handle image path safely
    let imageSrc = '/assets/images/no-image.jpg';
    if (item.image_path) {
        if (item.image_path.startsWith('http') || item.image_path.startsWith('/uploads/')) {
            imageSrc = item.image_path;
        } else {
            imageSrc = '/uploads/products/' + item.image_path;
        }
    }
    img.src = imageSrc;
    img.onerror = function() { this.src = '/assets/images/no-image.jpg'; };
    
    cartItemDiv.appendChild(img);

    // Product details container
    const detailsDiv = document.createElement('div');
    detailsDiv.style.cssText = 'flex: 1;';

    // Product name
    const nameH3 = document.createElement('h3');
    nameH3.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333;';
    nameH3.textContent = item.name || 'Unknown Product';
    detailsDiv.appendChild(nameH3);

    // Product description
    const descP = document.createElement('p');
    descP.style.cssText = 'margin: 0; color: #666; font-size: 0.9rem;';
    descP.textContent = item.description || 'No description';
    detailsDiv.appendChild(descP);

    // Price and quantity
    const priceP = document.createElement('p');
    priceP.style.cssText = 'margin: 0.5rem 0 0 0; font-weight: bold; color: #2c5aa0;';
    priceP.textContent = `$${price.toFixed(2)} × ${quantity}`;
    detailsDiv.appendChild(priceP);

    // Stock warning
    if (item.stock < 10) {
        const stockP = document.createElement('p');
        stockP.style.cssText = 'margin: 0.25rem 0 0 0; color: #dc3545; font-size: 0.8rem;';
        stockP.textContent = `Only ${item.stock} left in stock`;
        detailsDiv.appendChild(stockP);
    }

    cartItemDiv.appendChild(detailsDiv);

    // Quantity controls
    const quantityDiv = document.createElement('div');
    quantityDiv.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';

    // Decrease button
    const decreaseBtn = document.createElement('button');
    decreaseBtn.style.cssText = 'background: #f8f9fa; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;';
    decreaseBtn.textContent = '−';
    decreaseBtn.onclick = function() { updateQuantity(item.product_id, quantity - 1); };
    if (quantity <= 1) {
        decreaseBtn.disabled = true;
        decreaseBtn.style.opacity = '0.5';
        decreaseBtn.style.cursor = 'not-allowed';
    }
    quantityDiv.appendChild(decreaseBtn);

    // Quantity display
    const quantitySpan = document.createElement('span');
    quantitySpan.style.cssText = 'min-width: 40px; text-align: center; font-weight: bold; font-size: 1.1rem;';
    quantitySpan.textContent = quantity;
    quantityDiv.appendChild(quantitySpan);

    // Increase button
    const increaseBtn = document.createElement('button');
    increaseBtn.style.cssText = 'background: #f8f9fa; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;';
    increaseBtn.textContent = '+';
    increaseBtn.onclick = function() { updateQuantity(item.product_id, quantity + 1); };
    if (quantity >= item.stock) {
        increaseBtn.disabled = true;
        increaseBtn.style.opacity = '0.5';
        increaseBtn.style.cursor = 'not-allowed';
    }
    quantityDiv.appendChild(increaseBtn);

    cartItemDiv.appendChild(quantityDiv);

    // Item total
    const totalDiv = document.createElement('div');
    totalDiv.style.cssText = 'font-weight: bold; min-width: 80px; text-align: right; font-size: 1.1rem; color: #2c5aa0;';
    totalDiv.textContent = `$${itemTotal.toFixed(2)}`;
    cartItemDiv.appendChild(totalDiv);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 1rem;';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove item';
    removeBtn.onclick = function() { removeItem(item.product_id); };
    cartItemDiv.appendChild(removeBtn);

    return cartItemDiv;
}

// SECURITY FIX: Create cart total section securely
function createCartTotalSection(itemCount, total) {
    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.style.cssText = 'padding: 1.5rem; text-align: right; font-size: 1.3rem; font-weight: bold; border-top: 2px solid #2c5aa0; background: #f8f9fa;';

    const countDiv = document.createElement('div');
    countDiv.style.cssText = 'color: #666; font-size: 1rem; margin-bottom: 0.5rem;';
    countDiv.textContent = `Total (${itemCount} items):`;
    totalDiv.appendChild(countDiv);

    const amountDiv = document.createElement('div');
    amountDiv.style.cssText = 'color: #2c5aa0;';
    amountDiv.textContent = `$${total.toFixed(2)}`;
    totalDiv.appendChild(amountDiv);

    return totalDiv;
}

// Keep the original displayCartItems function as displayCartItemsLegacy for backward compatibility
function displayCartItems(items) {
    displayCartItemsSecurely(items);
}

function displayEmptyCart() {
    console.log('📭 Displaying empty cart');

    const cartContainer = document.getElementById('cart-items') || document.getElementById('cart-summary');
    if (!cartContainer) return;

    // Clear and create empty cart display securely
    cartContainer.innerHTML = '';

    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-cart';
    emptyDiv.style.cssText = 'text-align: center; padding: 3rem 2rem;';

    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 4rem; margin-bottom: 1rem; opacity: 0.7;';
    icon.textContent = '🛒';
    emptyDiv.appendChild(icon);

    const heading = document.createElement('h3');
    heading.style.cssText = 'color: #666; margin-bottom: 1rem;';
    heading.textContent = 'Your cart is empty';
    emptyDiv.appendChild(heading);

    const text = document.createElement('p');
    text.style.cssText = 'color: #888; margin-bottom: 2rem; font-size: 1rem;';
    text.textContent = 'Discover our amazing products and start shopping!';
    emptyDiv.appendChild(text);

    const link = document.createElement('a');
    link.href = 'catalog.html';
    link.className = 'btn btn-primary';
    link.style.cssText = 'display: inline-block; background: #2c5aa0; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; transition: background 0.3s;';
    link.textContent = 'Browse Products';
    emptyDiv.appendChild(link);

    cartContainer.appendChild(emptyDiv);
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

// Secure notification function
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

    notification.textContent = message; // Safe text insertion
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}