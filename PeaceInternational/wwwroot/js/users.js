"use strict";

let usersData = [];

const showToast = (type, message) => Toast.show(type, message, 3000);

const loadUsers = () => {
    $.ajax({
        url: 'Users/Get',
        method: 'GET',
        success: (data) => { usersData = data; renderTable(data); },
        error: () => showToast('error', 'Failed to load users')
    });
};

const renderTable = (data) => {
    const tableBody = document.getElementById('tableBody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-12">
                    <div class="flex flex-col items-center gap-4">
                        <i data-lucide="shield-check" class="w-16 h-16 text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No users found</h3>
                            <p class="text-base-content/70">Start by adding your first user</p>
                        </div>
                    </div>
                </td>
            </tr>`;
        refreshIcons();
        return;
    }

    console.log(data);

    tableBody.innerHTML = data.map(user => `
        <tr class="hover transition-colors duration-200" data-username="${escapeHtml(user.userName).toLowerCase()}">
            <td class="font-semibold">${escapeHtml(user.userName) || '-'}</td>
            <td>${escapeHtml(user.email) || '-'}</td>
            <td>${escapeHtml(user.phoneNumber) || '-'}</td>
            <td><div class="badge ${user.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}">${escapeHtml(user.role) || '-'}</div></td>
            <td>
                <div class="flex gap-1 justify-center">
                    <button onclick="editUser('${user.id}')" class="btn btn-ghost btn-xs" title="Edit">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="changePasswordUser('${user.id}')" class="btn btn-ghost btn-xs text-info" title="Change Password">
                        <i data-lucide="key" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" class="btn btn-ghost btn-xs text-error" title="Delete">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    refreshIcons();
};

const filterTable = () => {
    const searchTerm = document.getElementById('searchField').value.toLowerCase();
    renderTable(usersData.filter(u => (u.userName || '').toLowerCase().includes(searchTerm)));
};

const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phoneNo').value = '';
    document.getElementById('role').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

const validateForm = (isEdit) => {
    let isValid = true;
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    if (!document.getElementById('username').value.trim()) {
        document.getElementById('username-error').textContent = 'Username is required';
        isValid = false;
    }

    const email = document.getElementById('email').value.trim();
    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email-error').textContent = 'Invalid email format';
        isValid = false;
    }

    if (!document.getElementById('phoneNo').value.trim()) {
        document.getElementById('phoneNo-error').textContent = 'Phone number is required';
        isValid = false;
    }

    if (!document.getElementById('role').value) {
        document.getElementById('role-error').textContent = 'Role is required';
        isValid = false;
    }

    if (!isEdit) {
        const password = document.getElementById('password').value;
        if (!password) {
            document.getElementById('password-error').textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 5) {
            document.getElementById('password-error').textContent = 'Password must be at least 5 characters';
            isValid = false;
        }
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (!confirmPassword) {
            document.getElementById('confirmPassword-error').textContent = 'Confirm password is required';
            isValid = false;
        } else if (password !== confirmPassword) {
            document.getElementById('confirmPassword-error').textContent = 'Passwords do not match';
            isValid = false;
        }
    }

    return isValid;
};

const validatePasswordForm = () => {
    let isValid = true;
    document.getElementById('newPassword-error').textContent = '';
    document.getElementById('confirmNewPassword-error').textContent = '';

    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
        document.getElementById('newPassword-error').textContent = 'New password is required';
        isValid = false;
    } else if (newPassword.length < 5) {
        document.getElementById('newPassword-error').textContent = 'Password must be at least 5 characters';
        isValid = false;
    }

    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    if (!confirmNewPassword) {
        document.getElementById('confirmNewPassword-error').textContent = 'Confirm password is required';
        isValid = false;
    } else if (newPassword !== confirmNewPassword) {
        document.getElementById('confirmNewPassword-error').textContent = 'Passwords do not match';
        isValid = false;
    }

    return isValid;
};

window.editUser = (id) => {
    const user = usersData.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userTitle').textContent = 'Edit User';
    document.getElementById('id').value = user.id;
    document.getElementById('username').value = user.userName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phoneNo').value = user.phoneNumber || '';
    document.getElementById('role').value = user.role || '';
    document.getElementById('passwordSection').style.display = 'none';

    document.getElementById('user-drawer').checked = true;
};

window.changePasswordUser = (id) => {
    const user = usersData.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userId').value = user.id;
    document.getElementById('changePwdUserName').value = user.userName;
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('newPassword-error').textContent = '';
    document.getElementById('confirmNewPassword-error').textContent = '';

    document.getElementById('pwd-drawer').checked = true;
};

window.deleteUser = (id) => {
    confirmAction('Are you sure you want to delete this user?', () => {
        $.ajax({
            url: 'Users/Delete',
            method: 'POST',
            data: { id },
            success: (data) => { showToast(data.type, data.message); loadUsers(); },
            error: () => showToast('error', 'Failed to delete user')
        });
    });
};

const saveUser = () => {
    const id = document.getElementById('id').value;
    const isEdit = !!id;

    if (!validateForm(isEdit)) return;

    const url = isEdit ? 'Users/Update' : 'Users/Save';
    const data = isEdit ? {
        id,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNo').value
    } : {
        Username: document.getElementById('username').value,
        Email: document.getElementById('email').value,
        Password: document.getElementById('password').value,
        ConfirmPassword: document.getElementById('confirmPassword').value,
        PhoneNumber: document.getElementById('phoneNo').value,
        Role: document.getElementById('role').value
    };

    $.ajax({
        url, method: 'POST', data,
        success: (res) => {
            showToast(res.type, res.message);
            document.getElementById('user-drawer').checked = false;
            loadUsers();
            clearForm();
        },
        error: () => showToast('error', 'Failed to save user')
    });
};

const saveNewPassword = () => {
    if (!validatePasswordForm()) return;

    $.ajax({
        url: 'Users/ChangePassword',
        method: 'POST',
        data: {
            UserId: document.getElementById('userId').value,
            NewPassword: document.getElementById('newPassword').value,
            ConfirmNewPassword: document.getElementById('confirmNewPassword').value
        },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('pwd-drawer').checked = false;
        },
        error: () => showToast('error', 'Failed to change password')
    });
};

$(document).ready(function () {
    loadUsers();

    document.querySelector('.drawer-button').addEventListener('click', () => {
        document.getElementById('userTitle').textContent = 'Add User';
        document.getElementById('passwordSection').style.display = '';
        clearForm();
    });

    document.getElementById('user-drawer').addEventListener('change', function () {
        if (!this.checked) {
            document.getElementById('passwordSection').style.display = '';
            clearForm();
        }
    });

    document.getElementById('usersForm').addEventListener('submit', (e) => { e.preventDefault(); saveUser(); });
    document.getElementById('changePasswordForm').addEventListener('submit', (e) => { e.preventDefault(); saveNewPassword(); });
    document.getElementById('searchField').addEventListener('input', filterTable);
});
