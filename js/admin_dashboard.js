document.addEventListener('DOMContentLoaded', () => {
    const logsTableBody = document.querySelector('#logsTable tbody');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageDisplay = document.getElementById('currentPage');

    let currentPage = 1;
    let totalPages = 1;

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

    async function fetchLogs(page = 1) {
        try {
            const response = await fetch(`php/admin_dashboard.php?action=list&page=${page}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.logs)) {
                logsTableBody.innerHTML = data.logs.map(log => `
                    <tr>
                        <td>${escapeHTML(log.id)}</td>
                        <td>${escapeHTML(log.username ?? 'Unknown')}</td>
                        <td>${escapeHTML(log.action)}</td>
                        <td>${escapeHTML(log.ip_addr)}</td>
                        <td>${escapeHTML(log.timestamp)}</td>
                    </tr>
                `).join('');

                currentPage = data.page;
                totalPages = Math.ceil(data.total / data.pageSize);
                updatePagination();
            } else {
                logsTableBody.innerHTML = `<tr><td colspan="5">No logs found</td></tr>`;
                currentPageDisplay.textContent = '';
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            logsTableBody.innerHTML = `<tr><td colspan="5">Error loading logs</td></tr>`;
            currentPageDisplay.textContent = '';
        }
    }

    function updatePagination() {
        currentPageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) fetchLogs(currentPage - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) fetchLogs(currentPage + 1);
    });

    fetchLogs(); // Initial fetch
});
