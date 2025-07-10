document.addEventListener('DOMContentLoaded', () => {
    const logsTableBody = document.querySelector('#logsTable tbody');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageDisplay = document.getElementById('currentPage');

    let currentPage = 1;
    let totalPages = 1;

    async function fetchLogs(page = 1) {
        try {
            const response = await fetch(`php/admin_dashboard.php?action=list&page=${page}`);
            const data = await response.json();

            logsTableBody.innerHTML = ''; // Clear table

            if (data.success && Array.isArray(data.logs)) {
                data.logs.forEach(log => {
                    const tr = document.createElement('tr');
                    ['log_id', 'username', 'action', 'ip_addr', 'timestamp'].forEach(key => {
                        const td = document.createElement('td');
                        td.textContent = log[key] ?? 'Unknown';
                        tr.appendChild(td);
                    });
                    logsTableBody.appendChild(tr);
                });

                currentPage = data.page;
                totalPages = Math.ceil(data.total / data.pageSize);
                updatePagination();
            } else {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 5;
                td.textContent = 'No logs found';
                tr.appendChild(td);
                logsTableBody.appendChild(tr);
                currentPageDisplay.textContent = '';
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            logsTableBody.innerHTML = '';
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.textContent = 'Error loading logs';
            tr.appendChild(td);
            logsTableBody.appendChild(tr);
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