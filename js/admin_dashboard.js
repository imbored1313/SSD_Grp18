document.addEventListener('DOMContentLoaded', () => {
    const logsTableBody = document.querySelector('#logsTable tbody');
    const paginationContainer = document.getElementById('pagination');
    const pageSize = 10;
    let logs = [];

    // Escapes HTML to prevent XSS
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match]));
    }

    // Fetch logs from backend
    async function fetchLogs() {
        try {
            const response = await fetch('php/admin_dashboard.php?action=list');
            const data = await response.json();
            if (Array.isArray(data)) {
                logs = data;
                renderPage(1);
                renderPagination(logs.length);
            } else {
                logsTableBody.innerHTML = `<tr><td colspan="5">No logs found</td></tr>`;
            }
        } catch (err) {
            logsTableBody.innerHTML = `<tr><td colspan="5">Error loading logs</td></tr>`;
            console.error('Error fetching logs:', err);
        }
    }

    // Renders logs for a specific page
    function renderPage(page) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageLogs = logs.slice(start, end);

        logsTableBody.innerHTML = pageLogs.map(log => `
            <tr>
                <td>${escapeHTML(log.id)}</td>
                <td>${escapeHTML(log.username ?? 'Unknown')}</td>
                <td>${escapeHTML(log.action)}</td>
                <td>${escapeHTML(log.ip_addr)}</td>
                <td>${escapeHTML(log.timestamp)}</td>
            </tr>
        `).join('');
    }

    // Renders pagination buttons
    function renderPagination(totalLogs) {
        const totalPages = Math.ceil(totalLogs / pageSize);
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = 'page-item';
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = i;

            a.addEventListener('click', (e) => {
                e.preventDefault();
                renderPage(i);
                setActivePage(i);
            });

            li.appendChild(a);
            paginationContainer.appendChild(li);
        }

        setActivePage(1);
    }

    function setActivePage(pageNum) {
        document.querySelectorAll('#pagination .page-link').forEach((link, index) => {
            link.parentElement.classList.toggle('active', index + 1 === pageNum);
        });
    }

    // Initialize
    fetchLogs();
});
