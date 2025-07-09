document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 My Orders page loading...');
    
    // Wait for session check to complete
    if (window.sessionManager && window.sessionManager.sessionCheckInProgress) {
        await window.sessionManager.waitForSessionCheck();
    }
    
    // Check if user is logged in
    if (!window.sessionManager || !window.sessionManager.isLoggedIn()) {
        console.log('❌ User not logged in, redirecting...');
        alert('Please log in to view your orders.');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ User is logged in, loading orders...');
    loadOrders();
});

function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    
    // Show loading state
    ordersList.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2c5aa0; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
            <p style="color: #666;">Loading your orders...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    fetch('php/get_orders.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📦 Orders data received:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load orders');
        }
        
        if (!data.orders || data.orders.length === 0) {
            displayNoOrders();
            return;
        }
        
        displayOrders(data.orders);
    })
    .catch(error => {
        console.error('❌ Error loading orders:', error);
        showError(error.message || 'Failed to load orders. Please try again.');
    });
}

function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    console.log(`🎨 Displaying ${orders.length} orders`);
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusColor = getStatusColor(order.status);
        const statusText = getStatusText(order.status);
        
        // Use total_amount from your database schema
        const totalAmount = parseFloat(order.total_amount || order.grand_total || 0);

        ordersHTML += `
            <div class="order-card" style="background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                <!-- Order Header -->
                <div style="background: #f8f9fa; padding: 1.5rem; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.2rem;">Order #${order.order_id}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">Placed on ${orderDate}</p>
                            ${order.paypal_order_id ? `<p style="margin: 0.25rem 0 0 0; color: #999; font-size: 0.8rem;">PayPal ID: ${order.paypal_order_id}</p>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="background: ${statusColor}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${statusText}
                            </div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: #2c5aa0;">
                                $${totalAmount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div style="padding: 1.5rem;">
                    ${generateOrderItems(order.items)}
                    
                    <!-- Order Summary -->
                    <div style="border-top: 1px solid #eee; margin-top: 1.5rem; padding-top: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                            <div style="color: #666;">
                                <p style="margin: 0; font-size: 0.9rem;">
                                    Payment Method: <strong>${order.payment_method || 'PayPal'}</strong>
                                </p>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #999;">
                                    ${order.items ? order.items.length : 0} item(s)
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">
                                    Items: ${parseFloat(order.items_total || 0).toFixed(2)}
                                    ${parseFloat(order.shipping_cost || 0) > 0 ? ` • Shipping: ${parseFloat(order.shipping_cost).toFixed(2)}` : ''}
                                    ${parseFloat(order.tax || 0) > 0 ? ` • Tax: ${parseFloat(order.tax).toFixed(2)}` : ''}
                                    ${parseFloat(order.discount || 0) > 0 ? ` • Discount: -${parseFloat(order.discount).toFixed(2)}` : ''}
                                </div>
                                <div style="font-size: 1.1rem; font-weight: bold; color: #333;">
                                    Total: ${totalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    ordersList.innerHTML = ordersHTML;
}

function generateOrderItems(items) {
    if (!items || items.length === 0) {
        return '<p style="color: #666; font-style: italic; text-align: center; padding: 2rem;">No items found for this order.</p>';
    }

    let itemsHTML = '';
    
    items.forEach(item => {
        let imageSrc = 'uploads/no-image.jpg';
        if (item.product_image) {
            if (item.product_image.startsWith('http') || item.product_image.startsWith('/uploads/')) {
                imageSrc = item.product_image;
            } else {
                imageSrc = '/uploads/products/' + item.product_image;
            }
        }

        const price = parseFloat(item.product_price || 0);
        const quantity = parseInt(item.quantity || 0);
        const subtotal = parseFloat(item.subtotal || (price * quantity));

        itemsHTML += `
            <div style="display: flex; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f0f0f0; gap: 1rem;">
                <img src="${imageSrc}" alt="${item.product_name}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;"
                     onerror="this.src='uploads/no-image.jpg'">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #333;">${item.product_name}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">
                        ${price.toFixed(2)} × ${quantity}
                    </p>
                </div>
                <div style="font-weight: bold; color: #2c5aa0; font-size: 1rem;">
                    ${subtotal.toFixed(2)}
                </div>
            </div>
        `;
    });

    return itemsHTML;
}

function displayNoOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.5;">📦</div>
            <h3 style="color: #666; margin-bottom: 1rem; font-size: 1.5rem;">No Orders Yet</h3>
            <p style="color: #999; margin-bottom: 2rem; font-size: 1.1rem; max-width: 400px; margin-left: auto; margin-right: auto;">
                You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <a href="catalog.html" style="background: #2c5aa0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem; transition: background 0.2s ease;" onmouseover="this.style.background='#1e3f73'" onmouseout="this.style.background='#2c5aa0'">
                Browse Products
            </a>
        </div>
    `;
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'delivered':
        case 'paid':
            return '#28a745';
        case 'processing':
        case 'shipped':
            return '#ffc107';
        case 'pending':
            return '#6c757d';
        case 'cancelled':
        case 'failed':
            return '#dc3545';
        default:
            return '#6c757d';
    }
}

function getStatusText(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'Completed';
        case 'processing':
            return 'Processing';
        case 'shipped':
            return 'Shipped';
        case 'delivered':
            return 'Delivered';
        case 'pending':
            return 'Pending';
        case 'cancelled':
            return 'Cancelled';
        case 'failed':
            return 'Failed';
        case 'paid':
            return 'Paid';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function showError(message) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #dc3545;">⚠️</div>
            <h3 style="color: #dc3545; margin-bottom: 1rem;">Error Loading Orders</h3>
            <p style="color: #666; margin-bottom: 2rem;">${message}</p>
            <button onclick="loadOrders()" style="background: #2c5aa0; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem;" onmouseover="this.style.background='#1e3f73'" onmouseout="this.style.background='#2c5aa0'">
                Try Again
            </button>
        </div>
    `;
}