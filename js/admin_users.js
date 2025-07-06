document.addEventListener('DOMContentLoaded', loadUsers);

function loadUsers()
{
    fetch('php/admin_users.php?action=list', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        data.forEach(u => {
            tbody.innerHTML += `
            <tr>
            <td>${escapeHTML(u.user_id)}</td>
            <td>${escapeHTML(u.username)}</td>
            <td>${escapeHTML(u.email)}</td>
            <td>${escapeHTML(u.first_name)} ${escapeHTML(u.last_name)}</td>
            <td>${escapeHTML(u.role)}</td>
            <td>${u.is_verified ? 'Yes' : 'No'}</td>
            <td>${escapeHTML(u.created_at)}</td>
            <td class="action-buttons">
              <button onclick="deleteUser(${u.user_id})" class="btn btn-danger btn-small">Delete</button>
              <button onclick="toggleRole(${u.user_id}, '${escapeHTML(u.role)}')" class="btn btn-secondary btn-small">
                ${u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
              </button>
            </td>
            </tr>`;
        });
    })
    .catch(err => {
        alert('Failed to load users: ' + err.message);
    });
}

function escapeHTML(str) {
    if (typeof str !== 'string') {
        return str === undefined || str === null ? '' : String(str);
    }
    return str.replace(/[&<>"']/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[tag]));
}

function deleteUser(id)
{
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

function toggleRole(id, currentRole)
{
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

function loadCurrentUser()
{
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

