document.addEventListener('DOMContentLoaded', function () {
    loadAllOrders();
});

async function loadAllOrders() {
    const ordersContainer = document.getElementById('orders-list');
    ordersContainer.innerHTML = '<p>Loading orders...</p>';

    try {
        const res = await fetch('php/get_all_orders.php', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        if (!data.orders || data.orders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        ordersContainer.innerHTML = data.orders.map(generateOrderCard).join('');
    } catch (error) {
        ordersContainer.innerHTML = `<p style="color:red;">Failed to load orders: ${error.message}</p>`;
    }
}

function generateOrderCard(order) {
    const orderDate = new Date(order.order_date).toLocaleString();
    const items = order.items.map(item => `
        <li>${item.product_name} (x${item.quantity}) — $${parseFloat(item.product_price).toFixed(2)}</li>
    `).join('');

    return `
        <div class="order-box" style="border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
            <h4>Order #${order.order_id}</h4>
            <p><strong>User:</strong> ${order.username} (${order.email})</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
            <ul>${items}</ul>
        </div>
    `;
}
