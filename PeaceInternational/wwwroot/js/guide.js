"use strict";

let guidesData = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load guides
const loadGuides = () => {
    $.ajax({
        url: 'Guide/Get',
        method: 'GET',
        success: (data) => {
            guidesData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load guides');
        }
    });
};

// Function to render table
const renderTable = (data) => {
    const tableBody = document.getElementById('tableBody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-12">
                    <div class="flex flex-col items-center gap-4">
                        <i data-lucide="user" class="w-16 h-16 text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No guides found</h3>
                            <p class="text-base-content/70">Start by adding your first guide</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(guide => `
        <tr class="hover transition-colors duration-200"
            data-guide-name="${escapeHtml(guide.name).toLowerCase()}">
            <td class="font-semibold">${escapeHtml(guide.name) || '-'}</td>
            <td class="text-sm tabular-nums">${guide.fullDayRate ?? '0'}</td>
            <td class="text-sm tabular-nums">${guide.halfDayRate ?? '0'}</td>
            <td class="text-sm tabular-nums">${guide.overNight ?? '0'}</td>
            <td>
                <div class="flex gap-1 justify-center">
                    <button onclick="editGuide(${guide.id})" class="btn btn-ghost btn-xs" title="Edit">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteGuide(${guide.id})" class="btn btn-ghost btn-xs text-error" title="Delete">
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

    const filtered = guidesData.filter(guide => {
        return (guide.name || '').toLowerCase().includes(searchTerm);
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('fullDayRate').value = '';
    document.getElementById('halfDayRate').value = '';
    document.getElementById('overnight').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Name validation
    const name = document.getElementById('name').value.trim();
    if (!name) {
        document.getElementById('name-error').textContent = 'Guide name is required';
        isValid = false;
    }

    // Full Day Rate validation
    const fullDayRate = document.getElementById('fullDayRate').value;
    if (!fullDayRate) {
        document.getElementById('fullDayRate-error').textContent = 'Full day rate is required';
        isValid = false;
    }

    // Half Day Rate validation
    const halfDayRate = document.getElementById('halfDayRate').value;
    if (!halfDayRate) {
        document.getElementById('halfDayRate-error').textContent = 'Half day rate is required';
        isValid = false;
    }

    // Overnight validation
    const overnight = document.getElementById('overnight').value;
    if (!overnight) {
        document.getElementById('overnight-error').textContent = 'Overnight rate is required';
        isValid = false;
    }

    return isValid;
};

// Function to edit guide
window.editGuide = (id) => {
    const guide = guidesData.find(g => g.id === id);
    if (!guide) return;

    document.getElementById('guideTitle').textContent = 'Edit Guide';
    document.getElementById('id').value = guide.id;
    document.getElementById('name').value = guide.name || '';
    document.getElementById('fullDayRate').value = guide.fullDayRate || '';
    document.getElementById('halfDayRate').value = guide.halfDayRate || '';
    document.getElementById('overnight').value = guide.overNight || '';

    // Open drawer
    document.getElementById('guide-drawer').checked = true;
};

window.deleteGuide = (id) => {
    confirmAction('Are you sure you want to delete this guide?', () => {
        $.ajax({
            url: 'Guide/Delete',
            method: 'POST',
            data: { id },
            success: (data) => { showToast(data.type, data.message); loadGuides(); },
            error: () => showToast('error', 'Failed to delete guide')
        });
    });
};

// Function to save guide
const saveGuide = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        Name: document.getElementById('name').value,
        FullDayRate: document.getElementById('fullDayRate').value,
        HalfDayRate: document.getElementById('halfDayRate').value,
        OverNight: document.getElementById('overnight').value
    };

    $.ajax({
        url: 'Guide/Save',
        method: 'POST',
        data: { guide: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('guide-drawer').checked = false;
            loadGuides();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save guide');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load guides on page load
    loadGuides();

    // Add guide button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('guideTitle').textContent = 'Add Guide';
        clearForm();
    });

    // Form submit
    document.getElementById('guideForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveGuide();
    });

    // Search filter
    document.getElementById('searchField').addEventListener('input', filterTable);
});
