document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadCurrentUser();
});

function loadUsers() {
    fetch('php/admin_users.php?action=list', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        data.forEach(u => {
            const tr = document.createElement('tr');

            const fields = [
                u.user_id,
                u.username,
                u.email,
                `${u.first_name} ${u.last_name}`,
                u.role,
                u.is_verified ? 'Yes' : 'No',
                u.created_at
            ];

            fields.forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });

            const actionTd = document.createElement('td');
            actionTd.className = 'action-buttons';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-small';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteUser(u.user_id);

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-secondary btn-small';
            toggleBtn.textContent = u.role === 'admin' ? 'Demote to User' : 'Promote to Admin';
            toggleBtn.onclick = () => toggleRole(u.user_id, u.role);

            actionTd.appendChild(deleteBtn);
            actionTd.appendChild(toggleBtn);
            tr.appendChild(actionTd);

            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        alert('Failed to load users: ' + err.message);
    });
}

function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    fetch(`php/admin_users.php?action=delete&id=${id}`, { credentials: 'include' })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('User deleted!');
            loadUsers();
        } else {
            alert('Delete failed.');
        }
    })
    .catch(err => alert('Delete failed: ' + err.message));
}

function toggleRole(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    fetch(`php/admin_users.php?action=changerole&id=${id}&role=${newRole}`, { credentials: 'include' })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('Role updated!');
            loadUsers();
        } else {
            alert('Role update failed.');
        }
    })
    .catch(err => alert('Role update failed: ' + err.message));
}

function loadCurrentUser() {
    fetch('php/admin_users.php?action=currentUser', { credentials: 'include' })
    .then(res => res.json())
    .then(user => {
        const header = document.querySelector('.admin-header');
        if (user && user.first_name) {
            const welcome = document.createElement('p');
            welcome.textContent = `Welcome, ${user.first_name}!`;
            header.appendChild(welcome);
        }
    })
    .catch(err => {
        console.error('Failed to load current user:', err);
    });
}