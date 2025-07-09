document.addEventListener('DOMContentLoaded', () => {
    fetchLogs();
});

async function fetchLogs() {
    try {
        const res = await fetch('php/admin_dashboard.php?action=list', {
            credentials: 'include'
        });

        const data = await res.json();
        renderLogs(data);
    } catch (err) {
        console.error('Error loading logs:', err);
        alert('Failed to load logs.');
    }
}

function renderLogs(logs) {
    const tbody = document.querySelector('#logsTable tbody');
    tbody.innerHTML = '';

    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No logs available</td></tr>';
        return;
    }

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.log_id}</td>
            <td>${escapeHTML(log.username || 'System')}</td>
            <td>${escapeHTML(log.action)}</td>
            <td>${escapeHTML(log.ip_addr)}</td>
            <td>${escapeHTML(log.timestamp)}</td>
        `;
        tbody.appendChild(row);
    });
}

function escapeHTML(str) {
    return str?.replace(/[&<>"']/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[tag])) ?? '';
}
