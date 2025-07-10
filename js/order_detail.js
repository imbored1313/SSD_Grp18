// js/order_detail.js - COMPLETE SECURE VERSION - XSS vulnerabilities fixed

// XSS Prevention: HTML escaping function
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        displayError('No order ID provided');
    }
});

async function loadOrderDetails(orderId) {
    try {
        showLoading();
        
        const response = await fetch(`php/get_order_details.php?id=${encodeURIComponent(orderId)}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.order) {
            displayOrderDetailsSecurely(data.order);
        } else {
            throw new Error(data.message || 'Failed to load order details');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        displayError('Failed to load order details: ' + error.message);
    } finally {
        hideLoading();
    }
}

// SECURITY FIX: Secure order details display using DOM methods
function displayOrderDetailsSecurely(order) {
    const container = document.getElementById('order-details');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create main order container
    const orderContainer = document.createElement('div');
    orderContainer.className = 'order-container';
    orderContainer.style.cssText = 'max-width: 800px; margin: 0 auto; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

    // Order header
    const header = createOrderHeader(order);
    orderContainer.appendChild(header);

    // Order status
    const status = createOrderStatus(order);
    orderContainer.appendChild(status);

    // Customer information
    const customerInfo = createCustomerInfo(order);
    orderContainer.appendChild(customerInfo);

    // Order items
    const itemsSection = createOrderItems(order);
    orderContainer.appendChild(itemsSection);

    // Order summary
    const summary = createOrderSummary(order);
    orderContainer.appendChild(summary);

    // Order notes (if any)
    if (order.notes) {
        const notesSection = createOrderNotes(order);
        orderContainer.appendChild(notesSection);
    }

    container.appendChild(orderContainer);
}

// SECURITY FIX: Create order header securely
function createOrderHeader(order) {
    const header = document.createElement('div');
    header.className = 'order-header';
    header.style.cssText = 'border-bottom: 2px solid #2c5aa0; padding-bottom: 1rem; margin-bottom: 2rem;';

    const title = document.createElement('h1');
    title.style.cssText = 'margin: 0 0 0.5rem 0; color: #2c5aa0; font-size: 2rem;';
    title.textContent = `Order #${order.order_id}`;
    header.appendChild(title);

    const date = document.createElement('p');
    date.style.cssText = 'margin: 0; color: #666; font-size: 1rem;';
    const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    date.textContent = `Placed on ${orderDate}`;
    header.appendChild(date);

    return header;
}

// SECURITY FIX: Create order status securely
function createOrderStatus(order) {
    const statusContainer = document.createElement('div');
    statusContainer.className = 'order-status';
    statusContainer.style.cssText = 'background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;';

    const statusLabel = document.createElement('h3');
    statusLabel.style.cssText = 'margin: 0 0 0.5rem 0; color: #333;';
    statusLabel.textContent = 'Order Status';
    statusContainer.appendChild(statusLabel);

    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';
    
    // Set status styling based on order status
    const status = (order.status || 'pending').toLowerCase();
    let statusColor = '#6c757d'; // default gray
    let statusBg = '#f8f9fa';
    
    switch(status) {
        case 'completed':
        case 'delivered':
            statusColor = '#28a745';
            statusBg = '#d4edda';
            break;
        case 'processing':
        case 'shipped':
            statusColor = '#007bff';
            statusBg = '#d1ecf1';
            break;
        case 'pending':
            statusColor = '#ffc107';
            statusBg = '#fff3cd';
            break;
        case 'cancelled':
            statusColor = '#dc3545';
            statusBg = '#f8d7da';
            break;
    }
    
    statusBadge.style.cssText = `display: inline-block; padding: 0.5rem 1rem; background: ${statusBg}; color: ${statusColor}; border-radius: 6px; font-weight: 600; text-transform: capitalize;`;
    statusBadge.textContent = order.status || 'Pending';
    statusContainer.appendChild(statusBadge);

    return statusContainer;
}

// SECURITY FIX: Create customer info securely
function createCustomerInfo(order) {
    const customerContainer = document.createElement('div');
    customerContainer.className = 'customer-info';
    customerContainer.style.cssText = 'margin-bottom: 2rem;';

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0 0 1rem 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;';
    title.textContent = 'Customer Information';
    customerContainer.appendChild(title);

    const infoGrid = document.createElement('div');
    infoGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;';

    // Customer name
    if (order.customer_name) {
        const nameField = createInfoField('Name', order.customer_name);
        infoGrid.appendChild(nameField);
    }

    // Customer email
    if (order.customer_email) {
        const emailField = createInfoField('Email', order.customer_email);
        infoGrid.appendChild(emailField);
    }

    // Customer phone
    if (order.customer_phone) {
        const phoneField = createInfoField('Phone', order.customer_phone);
        infoGrid.appendChild(phoneField);
    }

    // Shipping address
    if (order.shipping_address) {
        const addressField = createInfoField('Shipping Address', order.shipping_address);
        infoGrid.appendChild(addressField);
    }

    customerContainer.appendChild(infoGrid);
    return customerContainer;
}

// SECURITY FIX: Create info field securely
function createInfoField(label, value) {
    const field = document.createElement('div');
    field.style.cssText = 'background: #f8f9fa; padding: 1rem; border-radius: 6px;';

    const labelEl = document.createElement('div');
    labelEl.style.cssText = 'font-weight: 600; color: #666; margin-bottom: 0.25rem; font-size: 0.9rem;';
    labelEl.textContent = label;
    field.appendChild(labelEl);

    const valueEl = document.createElement('div');
    valueEl.style.cssText = 'color: #333; font-size: 1rem;';
    valueEl.textContent = value || 'Not provided';
    field.appendChild(valueEl);

    return field;
}

// SECURITY FIX: Create order items securely
function createOrderItems(order) {
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'order-items';
    itemsContainer.style.cssText = 'margin-bottom: 2rem;';

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0 0 1rem 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;';
    title.textContent = 'Order Items';
    itemsContainer.appendChild(title);

    if (!order.items || order.items.length === 0) {
        const noItems = document.createElement('p');
        noItems.style.cssText = 'color: #666; font-style: italic;';
        noItems.textContent = 'No items found for this order.';
        itemsContainer.appendChild(noItems);
        return itemsContainer;
    }

    const itemsList = document.createElement('div');
    itemsList.className = 'items-list';

    order.items.forEach(item => {
        const itemCard = createOrderItemCard(item);
        itemsList.appendChild(itemCard);
    });

    itemsContainer.appendChild(itemsList);
    return itemsContainer;
}

// SECURITY FIX: Create order item card securely
function createOrderItemCard(item) {
    const card = document.createElement('div');
    card.className = 'order-item-card';
    card.style.cssText = 'border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;';

    // Product image
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = 'flex-shrink: 0;';

    const img = document.createElement('img');
    img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 6px;';
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
    
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    // Product details
    const detailsContainer = document.createElement('div');
    detailsContainer.style.cssText = 'flex: 1;';

    // Product name - SECURE: Using textContent
    const name = document.createElement('h4');
    name.style.cssText = 'margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem;';
    name.textContent = item.product_name || 'Unknown Product';
    detailsContainer.appendChild(name);

    // Product description - SECURE: Using textContent
    if (item.product_description) {
        const description = document.createElement('p');
        description.style.cssText = 'margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;';
        const truncatedDesc = item.product_description.length > 100 
            ? item.product_description.substring(0, 100) + '...'
            : item.product_description;
        description.textContent = truncatedDesc;
        detailsContainer.appendChild(description);
    }

    // Quantity and price info
    const priceInfo = document.createElement('div');
    priceInfo.style.cssText = 'display: flex; gap: 1rem; align-items: center;';

    const quantity = document.createElement('span');
    quantity.style.cssText = 'color: #666;';
    quantity.textContent = `Qty: ${item.quantity || 1}`;
    priceInfo.appendChild(quantity);

    const price = document.createElement('span');
    price.style.cssText = 'color: #2c5aa0; font-weight: 600;';
    price.textContent = `$${parseFloat(item.product_price || 0).toFixed(2)} each`;
    priceInfo.appendChild(price);

    const total = document.createElement('span');
    total.style.cssText = 'color: #333; font-weight: 700; margin-left: auto;';
    const itemTotal = parseFloat(item.product_price || 0) * parseInt(item.quantity || 1);
    total.textContent = `$${itemTotal.toFixed(2)}`;
    priceInfo.appendChild(total);

    detailsContainer.appendChild(priceInfo);
    card.appendChild(detailsContainer);

    return card;
}

// SECURITY FIX: Create order summary securely
function createOrderSummary(order) {
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'order-summary';
    summaryContainer.style.cssText = 'background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;';

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0 0 1rem 0; color: #333;';
    title.textContent = 'Order Summary';
    summaryContainer.appendChild(title);

    const summaryGrid = document.createElement('div');
    summaryGrid.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

    // Subtotal
    if (order.subtotal) {
        const subtotalRow = createSummaryRow('Subtotal', `$${parseFloat(order.subtotal).toFixed(2)}`);
        summaryGrid.appendChild(subtotalRow);
    }

    // Tax
    if (order.tax_amount) {
        const taxRow = createSummaryRow('Tax', `$${parseFloat(order.tax_amount).toFixed(2)}`);
        summaryGrid.appendChild(taxRow);
    }

    // Shipping
    if (order.shipping_cost) {
        const shippingRow = createSummaryRow('Shipping', `$${parseFloat(order.shipping_cost).toFixed(2)}`);
        summaryGrid.appendChild(shippingRow);
    }

    // Total
    const totalRow = createSummaryRow('Total', `$${parseFloat(order.total_amount || 0).toFixed(2)}`, true);
    summaryGrid.appendChild(totalRow);

    summaryContainer.appendChild(summaryGrid);
    return summaryContainer;
}

// SECURITY FIX: Create summary row securely
function createSummaryRow(label, value, isTotal = false) {
    const row = document.createElement('div');
    row.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; ${isTotal ? 'border-top: 2px solid #2c5aa0; margin-top: 0.5rem; font-weight: 700; font-size: 1.1rem;' : ''}`;

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    row.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.style.cssText = isTotal ? 'color: #2c5aa0;' : 'color: #333;';
    valueEl.textContent = value;
    row.appendChild(valueEl);

    return row;
}

// SECURITY FIX: Create order notes securely
function createOrderNotes(order) {
    const notesContainer = document.createElement('div');
    notesContainer.className = 'order-notes';
    notesContainer.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; padding: 1rem; border-radius: 8px;';

    const title = document.createElement('h4');
    title.style.cssText = 'margin: 0 0 0.5rem 0; color: #856404;';
    title.textContent = 'Order Notes';
    notesContainer.appendChild(title);

    const notesText = document.createElement('p');
    notesText.style.cssText = 'margin: 0; color: #856404; line-height: 1.5;';
    notesText.textContent = order.notes;
    notesContainer.appendChild(notesText);

    return notesContainer;
}

function showLoading() {
    const container = document.getElementById('order-details');
    if (!container) return;

    container.innerHTML = '';
    
    const loading = document.createElement('div');
    loading.style.cssText = 'text-align: center; padding: 4rem 2rem; color: #666;';
    
    const spinner = document.createElement('div');
    spinner.style.cssText = 'display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2c5aa0; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;';
    loading.appendChild(spinner);
    
    const text = document.createElement('p');
    text.textContent = 'Loading order details...';
    loading.appendChild(text);
    
    container.appendChild(loading);

    // Add CSS animation if not already present
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

function hideLoading() {
    // Loading state is replaced when displayOrderDetailsSecurely() is called
}

function displayError(message) {
    const container = document.getElementById('order-details');
    if (!container) return;

    container.innerHTML = '';
    
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = 'text-align: center; padding: 4rem 2rem; color: #dc3545;';
    
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 4rem; margin-bottom: 1rem; opacity: 0.7;';
    icon.textContent = '⚠️';
    errorContainer.appendChild(icon);
    
    const heading = document.createElement('h3');
    heading.style.cssText = 'margin-bottom: 1rem; color: #dc3545;';
    heading.textContent = 'Error Loading Order';
    errorContainer.appendChild(heading);
    
    const text = document.createElement('p');
    text.style.cssText = 'margin-bottom: 2rem; color: #666;';
    text.textContent = message || 'Failed to load order details';
    errorContainer.appendChild(text);
    
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back to Orders';
    backBtn.style.cssText = 'padding: 0.75rem 1.5rem; background: #2c5aa0; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;';
    backBtn.onclick = function() {
        window.location.href = 'my_orders.html';
    };
    errorContainer.appendChild(backBtn);
    
    container.appendChild(errorContainer);
}

// SECURITY FIX: Secure notification function
function showNotificationSecure(message, type = 'info') {
    const existing = document.getElementById('order-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'order-notification';

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
        transition: opacity 0.3s ease;
    `;

    // CRITICAL: Use textContent instead of innerHTML to prevent XSS
    notification.textContent = String(message || ''); // Safe text insertion
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Keep original function name for backward compatibility
function showNotification(message, type = 'info') {
    showNotificationSecure(message, type);
}