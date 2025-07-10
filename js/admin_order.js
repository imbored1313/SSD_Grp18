// js/admin_order.js - SECURE VERSION - XSS vulnerabilities fixed

document.addEventListener('DOMContentLoaded', function () {
    loadAllOrdersSecurely();
});

// SECURITY FIX: Secure order loading function
async function loadAllOrdersSecurely() {
    const ordersContainer = document.getElementById('orders-list');
    
    // Clear and show loading state
    ordersContainer.innerHTML = '';
    const loadingDiv = document.createElement('p');
    loadingDiv.textContent = 'Loading orders...';
    ordersContainer.appendChild(loadingDiv);

    try {
        const res = await fetch('php/admin_orders.php', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        // Clear loading state
        ordersContainer.innerHTML = '';

        if (!data.orders || data.orders.length === 0) {
            const noOrdersDiv = document.createElement('p');
            noOrdersDiv.textContent = 'No orders found.';
            ordersContainer.appendChild(noOrdersDiv);
            return;
        }

        // Create orders display securely
        data.orders.forEach(order => {
            const orderCard = generateSecureOrderCard(order);
            ordersContainer.appendChild(orderCard);
        });

    } catch (error) {
        ordersContainer.innerHTML = '';
        const errorDiv = document.createElement('p');
        errorDiv.style.color = 'red';
        errorDiv.textContent = `Failed to load orders: ${error.message}`;
        ordersContainer.appendChild(errorDiv);
    }
}

// SECURITY FIX: Generate order card using DOM methods
function generateSecureOrderCard(order) {
    const orderBox = document.createElement('div');
    orderBox.className = 'order-box';
    orderBox.style.cssText = 'border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;';

    // Order title
    const title = document.createElement('h4');
    title.textContent = `Order #${order.order_id}`;
    orderBox.appendChild(title);

    // User info
    const userInfo = document.createElement('p');
    const userStrong = document.createElement('strong');
    userStrong.textContent = 'User: ';
    userInfo.appendChild(userStrong);
    userInfo.appendChild(document.createTextNode(`${order.username} (${order.email})`));
    orderBox.appendChild(userInfo);

    // Status
    const statusInfo = document.createElement('p');
    const statusStrong = document.createElement('strong');
    statusStrong.textContent = 'Status: ';
    statusInfo.appendChild(statusStrong);
    statusInfo.appendChild(document.createTextNode(order.status));
    orderBox.appendChild(statusInfo);

    // Date
    const dateInfo = document.createElement('p');
    const dateStrong = document.createElement('strong');
    dateStrong.textContent = 'Date: ';
    dateInfo.appendChild(dateStrong);
    const orderDate = new Date(order.order_date).toLocaleString();
    dateInfo.appendChild(document.createTextNode(orderDate));
    orderBox.appendChild(dateInfo);

    // Total
    const totalInfo = document.createElement('p');
    const totalStrong = document.createElement('strong');
    totalStrong.textContent = 'Total: ';
    totalInfo.appendChild(totalStrong);
    totalInfo.appendChild(document.createTextNode(`$${parseFloat(order.total_amount).toFixed(2)}`));
    orderBox.appendChild(totalInfo);

    // Items list
    if (order.items && order.items.length > 0) {
        const itemsList = document.createElement('ul');
        
        order.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.product_name} (x${item.quantity}) — $${parseFloat(item.product_price).toFixed(2)}`;
            itemsList.appendChild(listItem);
        });
        
        orderBox.appendChild(itemsList);
    }

    return orderBox;
}

// Keep original function name for backward compatibility
async function loadAllOrders() {
    await loadAllOrdersSecurely();
}

// Keep original function name for backward compatibility but make it secure
function generateOrderCard(order) {
    return generateSecureOrderCard(order);
}