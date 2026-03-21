"use strict";

let usersData = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load users
const loadUsers = () => {
    $.ajax({
        url: 'Users/Get',
        method: 'GET',
        success: (data) => {
            usersData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load users');
        }
    });
};

// Function to render table
const renderTable = (data) => {
    const tableBody = document.getElementById('tableBody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-12">
                    <div class="flex flex-col items-center gap-4">
                        <i data-lucide="shield-check" class="w-16 h-16 text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No users found</h3>
                            <p class="text-base-content/70">Start by adding your first user</p>
                        </div>
                        <label for="user-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            Add User
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(user => `
        <tr class="hover transition-colors duration-200"
            data-username="${escapeHtml(user.userName).toLowerCase()}">
            <td class="font-semibold">${escapeHtml(user.userName) || '-'}</td>
            <td>${escapeHtml(user.phoneNumber) || '-'}</td>
            <td>
                <div class="badge ${user.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}">${escapeHtml(user.role) || '-'}</div>
            </td>
            <td>
                <div class="flex gap-1 justify-center">
                    <button onclick="editUser(${user.id})" class="btn btn-ghost btn-xs" title="Edit">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="viewUser(${user.id})" class="btn btn-ghost btn-xs text-info" title="Change Password">
                        <i data-lucide="key" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteUser(${user.id})" class="btn btn-ghost btn-xs text-error" title="Delete">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    refreshIcons();
};

// Function to filter table
const filterTable = () => {
    const searchTerm = document.getElementById('searchField').value.toLowerCase();

    const filtered = usersData.filter(user => {
        return (user.userName || '').toLowerCase().includes(searchTerm);
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phoneNo').value = '';
    document.getElementById('role').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

// Function to clear password form
const clearPasswordForm = () => {
    document.getElementById('userId').value = '';
    document.getElementById('changePwdUserName').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

// Function to validate user form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Username validation
    const username = document.getElementById('username').value.trim();
    if (!username) {
        document.getElementById('username-error').textContent = 'Username is required';
        isValid = false;
    }

    // Email validation
    const email = document.getElementById('email').value.trim();
    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email-error').textContent = 'Invalid email format';
        isValid = false;
    }

    // Phone validation
    const phoneNo = document.getElementById('phoneNo').value.trim();
    if (!phoneNo) {
        document.getElementById('phoneNo-error').textContent = 'Phone number is required';
        isValid = false;
    }

    // Role validation
    const role = document.getElementById('role').value;
    if (!role) {
        document.getElementById('role-error').textContent = 'Role is required';
        isValid = false;
    }

    // Password validation
    const password = document.getElementById('password').value;
    if (!password) {
        document.getElementById('password-error').textContent = 'Password is required';
        isValid = false;
    } else if (password.length < 5) {
        document.getElementById('password-error').textContent = 'Password must be at least 5 characters';
        isValid = false;
    }

    // Confirm Password validation
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!confirmPassword) {
        document.getElementById('confirmPassword-error').textContent = 'Confirm password is required';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPassword-error').textContent = 'Passwords do not match';
        isValid = false;
    }

    return isValid;
};

// Function to validate password form
const validatePasswordForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // New Password validation
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
        document.getElementById('newPassword-error').textContent = 'New password is required';
        isValid = false;
    } else if (newPassword.length < 5) {
        document.getElementById('newPassword-error').textContent = 'Password must be at least 5 characters';
        isValid = false;
    }

    // Confirm New Password validation
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

// Function to edit user (open change password drawer)
window.editUser = (id) => {
    const user = usersData.find(u => u.id === id);
    if (!user) return;
    changePassword(id, user.userName);
};

// Function to view user (alias for change password)
window.viewUser = (id) => {
    const user = usersData.find(u => u.id === id);
    if (!user) return;
    changePassword(id, user.userName);
};

const changePassword = (userId, username) => {
    document.getElementById('userId').value = userId;
    document.getElementById('changePwdUserName').value = username;
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    document.getElementById('password-drawer').checked = true;
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

// Function to save user
const saveUser = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        Username: document.getElementById('username').value,
        Password: document.getElementById('password').value,
        ConfirmPassword: document.getElementById('confirmPassword').value,
        PhoneNumber: document.getElementById('phoneNo').value,
        Role: document.getElementById('role').value
    };

    $.ajax({
        url: 'Users/Save',
        method: 'POST',
        data: { newUser: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('user-drawer').checked = false;
            loadUsers();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save user');
        }
    });
};

// Function to save new password
const saveNewPassword = () => {
    if (!validatePasswordForm()) {
        return;
    }

    const record = {
        UserId: document.getElementById('userId').value,
        NewPassword: document.getElementById('newPassword').value,
        ConfirmNewPassword: document.getElementById('confirmNewPassword').value
    };

    $.ajax({
        url: 'Users/ChangePassword',
        method: 'POST',
        data: { newPassword: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('password-drawer').checked = false;
            clearPasswordForm();
        },
        error: () => {
            showToast('error', 'Failed to change password');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load users on page load
    loadUsers();

    // Add user button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('userTitle').textContent = 'Add User';
        clearForm();
    });

    // User form submit
    document.getElementById('usersForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });

    // Password form submit
    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNewPassword();
    });

    // Search filter
    document.getElementById('searchField').addEventListener('input', filterTable);
});
