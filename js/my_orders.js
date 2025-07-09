document.addEventListener('DOMContentLoaded', async function() {
    // Wait for session check to complete
    if (window.sessionManager.sessionCheckInProgress) {
        await window.sessionManager.waitForSessionCheck();
    }
    if (!window.sessionManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    const ordersList = document.getElementById('orders-list');

    fetch('php/get_orders.php', {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success || !data.orders || data.orders.length === 0) {
            ordersList.innerHTML = `<div style="text-align:center; color:#888; margin-top:3rem;">You have no orders yet.</div>`;
            return;
        }
        ordersList.innerHTML = '';
        data.orders.forEach(order => {
            const orderDate = new Date(order.order_date).toLocaleString();
            const itemsPreview = order.items.slice(0, 3).map(item => `
                <div style="display:inline-block; margin-right:8px; text-align:center;">
                    <img src="${item.product_image || 'uploads/no-image.jpg'}" alt="${item.product_name}" style="width:48px; height:48px; object-fit:cover; border-radius:6px; border:1px solid #eee;">
                    <div style="font-size:0.85em; color:#555; max-width:70px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.product_name}</div>
                </div>
            `).join('');
            const moreItems = order.items.length > 3 ? `<span style="font-size:0.9em; color:#888;">+${order.items.length - 3} more</span>` : '';
            ordersList.innerHTML += `
                <div class="order-card" style="background:#fff; border:1px solid #eee; border-radius:10px; margin-bottom:2rem; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
                        <div>
                            <div style="font-weight:bold; font-size:1.1em;">Order #${order.order_id}</div>
                            <div style="color:#888; font-size:0.95em;">${orderDate}</div>
                            <div style="margin-top:0.5em; font-size:0.98em;">Status: <span style="color:#2c5aa0; font-weight:bold;">${order.status}</span></div>
                        </div>
                        <div style="text-align:right; min-width:120px;">
                            <div style="font-size:1.1em; color:#2c5aa0; font-weight:bold;">$${parseFloat(order.grand_total || order.total_amount || 0).toFixed(2)}</div>
                            <a href="order_detail.html?order_id=${order.order_id}" class="btn" style="display:inline-block; margin-top:0.7em; background:#2c5aa0; color:#fff; padding:0.5em 1.2em; border-radius:6px; text-decoration:none; font-weight:bold; font-size:0.97em;">View Details</a>
                        </div>
                    </div>
                    <div style="margin-top:1.2em; display:flex; align-items:center; flex-wrap:wrap; gap:10px;">
                        ${itemsPreview} ${moreItems}
                    </div>
                </div>
            `;
        });
    })
    .catch(err => {
        ordersList.innerHTML = `<div style="color:#c00; text-align:center;">Failed to load orders. Please try again later.</div>`;
    });
}); 