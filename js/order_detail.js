document.addEventListener('DOMContentLoaded', function() {
    if (!window.sessionManager || !window.sessionManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    const orderDetail = document.getElementById('order-detail');
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    if (!orderId) {
        orderDetail.innerHTML = '<div style="color:#c00;">No order selected.</div>';
        return;
    }
    fetch('php/get_orders.php?order_id=' + encodeURIComponent(orderId), {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success || !data.order) {
            orderDetail.innerHTML = '<div style="color:#c00;">Order not found.</div>';
            return;
        }
        const order = data.order;
        // Order header
        let html = `<div style="background:#fff; border:1px solid #eee; border-radius:10px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.03); margin-bottom:2rem;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; align-items:center;">
                <div>
                    <div style="font-weight:bold; font-size:1.2em;">Order #${order.order_id}</div>
                    <div style="color:#888; font-size:0.98em;">${new Date(order.order_date).toLocaleString()}</div>
                    <div style="margin-top:0.5em; font-size:1em;">Status: <span style="color:#2c5aa0; font-weight:bold;">${order.status}</span></div>
                </div>
                <div style="text-align:right; min-width:120px;">
                    <div style="font-size:1.2em; color:#2c5aa0; font-weight:bold;">$${parseFloat(order.grand_total || order.total_amount || 0).toFixed(2)}</div>
                </div>
            </div>
        </div>`;
        // Itemized list
        html += `<div style="background:#f8f9fa; border-radius:10px; padding:1.2rem; margin-bottom:2rem;">
            <div style="font-weight:bold; font-size:1.1em; margin-bottom:1em;">Items</div>`;
        order.items.forEach(item => {
            html += `<div style="display:flex; align-items:center; border-bottom:1px solid #eee; padding:0.7em 0; gap:1em;">
                <img src="${item.product_image || 'uploads/no-image.jpg'}" alt="${item.product_name}" style="width:60px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #ddd;">
                <div style="flex:1;">
                    <a href="product_detail.html?product_id=${item.product_id}" style="font-weight:bold; color:#2c5aa0; text-decoration:none;">${item.product_name}</a>
                    <div style="color:#888; font-size:0.97em;">Unit Price: $${parseFloat(item.product_price).toFixed(2)}</div>
                </div>
                <div style="min-width:60px; text-align:center;">Qty: <b>${item.quantity}</b></div>
                <div style="min-width:80px; text-align:right; font-weight:bold; color:#2c5aa0;">$${parseFloat(item.subtotal).toFixed(2)}</div>
            </div>`;
        });
        html += `</div>`;
        // Order progress (simple timeline)
        html += `<div style="margin-bottom:2rem;">
            <div style="font-weight:bold; font-size:1.1em; margin-bottom:0.7em;">Order Progress</div>
            <div style="display:flex; flex-wrap:wrap; gap:1.5em; align-items:center;">
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:1.3em;">📝</span>
                    <span style="font-size:0.95em; color:#555;">Received</span>
                    <span style="font-size:0.85em; color:#888;">${new Date(order.order_date).toLocaleString()}</span>
                </div>
                <div style="width:30px; height:2px; background:#2c5aa0; align-self:center;"></div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:1.3em;">📦</span>
                    <span style="font-size:0.95em; color:#555;">Processing</span>
                </div>
                <div style="width:30px; height:2px; background:#eee; align-self:center;"></div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:1.3em;">🚚</span>
                    <span style="font-size:0.95em; color:#555;">Shipped</span>
                </div>
                <div style="width:30px; height:2px; background:#eee; align-self:center;"></div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:1.3em;">✅</span>
                    <span style="font-size:0.95em; color:#555;">Delivered</span>
                </div>
            </div>
        </div>`;
        // Shipping details
        html += `<div style="margin-bottom:2rem;">
            <div style="font-weight:bold; font-size:1.1em; margin-bottom:0.7em;">Shipping Details</div>
            <div style="color:#555;">${order.shipping_name || ''}</div>
            <div style="color:#555;">${order.shipping_address || ''}</div>
            <div style="color:#888; font-size:0.97em;">Method: ${order.shipping_method || 'Standard'}</div>
            ${order.shipping_tracking_number ? `<div style="color:#888; font-size:0.97em;">Tracking: <a href="#" style="color:#2c5aa0;">${order.shipping_tracking_number}</a></div>` : ''}
            ${order.shipping_eta ? `<div style="color:#888; font-size:0.97em;">ETA: ${new Date(order.shipping_eta).toLocaleDateString()}</div>` : ''}
        </div>`;
        // Billing & payment
        html += `<div style="margin-bottom:2rem;">
            <div style="font-weight:bold; font-size:1.1em; margin-bottom:0.7em;">Billing & Payment</div>
            <div style="color:#555;">Payment Method: ${order.payment_method || ''} ${order.payment_details ? '(' + order.payment_details + ')' : ''}</div>
            <div style="color:#555;">Billing Address: ${order.billing_address || order.shipping_address || ''}</div>
        </div>`;
        // Cost breakdown
        html += `<div style="margin-bottom:2rem;">
            <div style="font-weight:bold; font-size:1.1em; margin-bottom:0.7em;">Cost Breakdown</div>
            <div style="display:flex; flex-wrap:wrap; gap:1em;">
                <div style="flex:1;">Items Total:</div><div style="min-width:100px; text-align:right;">$${parseFloat(order.items_total || 0).toFixed(2)}</div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:1em;">
                <div style="flex:1;">Shipping:</div><div style="min-width:100px; text-align:right;">$${parseFloat(order.shipping_cost || 0).toFixed(2)}</div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:1em;">
                <div style="flex:1;">Tax:</div><div style="min-width:100px; text-align:right;">$${parseFloat(order.tax || 0).toFixed(2)}</div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:1em;">
                <div style="flex:1;">Discount:</div><div style="min-width:100px; text-align:right;">-$${parseFloat(order.discount || 0).toFixed(2)}</div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:1em; font-weight:bold; color:#2c5aa0;">
                <div style="flex:1;">Grand Total:</div><div style="min-width:100px; text-align:right;">$${parseFloat(order.grand_total || order.total_amount || 0).toFixed(2)}</div>
            </div>
        </div>`;
        // Actions
        html += `<div style="margin-bottom:2rem; display:flex; flex-wrap:wrap; gap:1em;">
            <button style="background:#2c5aa0; color:#fff; border:none; padding:0.7em 1.5em; border-radius:6px; font-weight:bold; cursor:pointer;">Download Invoice</button>
            <button style="background:#eee; color:#2c5aa0; border:none; padding:0.7em 1.5em; border-radius:6px; font-weight:bold; cursor:pointer;">Reorder</button>
            <button style="background:#eee; color:#2c5aa0; border:none; padding:0.7em 1.5em; border-radius:6px; font-weight:bold; cursor:pointer;">Request Return</button>
            <button style="background:#eee; color:#2c5aa0; border:none; padding:0.7em 1.5em; border-radius:6px; font-weight:bold; cursor:pointer;">Contact Support</button>
        </div>`;
        // Notes/FAQ
        if (order.notes) {
            html += `<div style="background:#f8f9fa; border-radius:8px; padding:1em; margin-bottom:2em; color:#555;">Note from seller: ${escapeHTML(order.notes)}</div>`;
        }
        html += `<div style="background:#f8f9fa; border-radius:8px; padding:1em; color:#888; font-size:0.97em;">For questions about returns, shipping, or customs, please see our <a href="#" style="color:#2c5aa0;">FAQs</a>.</div>`;
        orderDetail.innerHTML = html;
    })
    .catch(err => {
        orderDetail.innerHTML = '<div style="color:#c00;">Failed to load order details. Please try again later.</div>';
    });
}); 

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

