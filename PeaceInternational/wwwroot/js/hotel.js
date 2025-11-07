"use strict";

let hotelsData = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load hotel data
const loadHotels = () => {
    $.ajax({
        url: 'Hotel/Get',
        method: 'GET',
        success: (data) => {
            hotelsData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load hotels');
        }
    });
};

// Function to render table
const renderTable = (data) => {
    const tableBody = document.getElementById('tableBody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-12">
                    <div class="flex flex-col items-center gap-4">
                        <i class="fas fa-hotel fa-4x text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No hotels found</h3>
                            <p class="text-base-content/70">Start by adding your first hotel</p>
                        </div>
                        <label for="hotel-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i class="fas fa-plus"></i>
                            Add Hotel
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(hotel => `
        <tr class="hover transition-colors duration-200"
            data-hotel-name="${(hotel.name || '').toLowerCase()}">
            <td class="font-semibold">${hotel.name || '-'}</td>
            <td>
                <div class="badge badge-outline">${hotel.code || '-'}</div>
            </td>
            <td>
                <div class="badge ${hotel.category === 'A' ? 'badge-primary' : hotel.category === 'B' ? 'badge-secondary' : 'badge-accent'}">
                    Category ${hotel.category || '-'}
                </div>
            </td>
            <td class="text-sm">${hotel.address || '-'}</td>
            <td>
                <div class="flex items-center gap-2">
                    <i class="fas fa-phone text-primary text-xs"></i>
                    <span class="text-sm">${hotel.phoneNo || '-'}</span>
                </div>
            </td>
            <td>
                <div class="flex gap-2 justify-center">
                    <button onclick="editHotel(${hotel.id})" class="btn btn-sm btn-info gap-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteHotel(${hotel.id})" class="btn btn-sm btn-error gap-2" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Function to filter table
const filterTable = () => {
    const searchTerm = document.getElementById('searchField').value.toLowerCase();

    const filtered = hotelsData.filter(hotel => {
        return (hotel.name || '').toLowerCase().includes(searchTerm);
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('code').value = '';
    document.getElementById('category').value = '';
    document.getElementById('address').value = '';
    document.getElementById('phoneNo').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Reset validation
    $('#hotelForm').validate().resetForm();
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Name validation
    const name = document.getElementById('name').value.trim();
    if (!name) {
        document.getElementById('name-error').textContent = 'Hotel name is required';
        isValid = false;
    }

    // Code validation
    const code = document.getElementById('code').value.trim();
    if (!code) {
        document.getElementById('code-error').textContent = 'Code is required';
        isValid = false;
    }

    // Category validation
    const category = document.getElementById('category').value;
    if (!category) {
        document.getElementById('category-error').textContent = 'Category is required';
        isValid = false;
    }

    // Address validation
    const address = document.getElementById('address').value.trim();
    if (!address) {
        document.getElementById('address-error').textContent = 'Address is required';
        isValid = false;
    }

    // Phone validation
    const phoneNo = document.getElementById('phoneNo').value.trim();
    if (!phoneNo) {
        document.getElementById('phoneNo-error').textContent = 'Phone number is required';
        isValid = false;
    }

    return isValid;
};

// Function to edit hotel
window.editHotel = (id) => {
    const hotel = hotelsData.find(h => h.id === id);
    if (!hotel) return;

    document.getElementById('hotelTitle').textContent = 'Edit Hotel';
    document.getElementById('id').value = hotel.id;
    document.getElementById('name').value = hotel.name || '';
    document.getElementById('code').value = hotel.code || '';
    document.getElementById('category').value = hotel.category || '';
    document.getElementById('address').value = hotel.address || '';
    document.getElementById('phoneNo').value = hotel.phoneNo || '';

    // Open drawer
    document.getElementById('hotel-drawer').checked = true;
};

// Function to delete hotel
window.deleteHotel = (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) {
        return;
    }

    $.ajax({
        url: 'Hotel/Delete',
        method: 'POST',
        data: { id: id },
        success: (data) => {
            showToast(data.type, data.message);
            loadHotels();
        },
        error: () => {
            showToast('error', 'Failed to delete hotel');
        }
    });
};

// Function to save hotel
const saveHotel = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        Name: document.getElementById('name').value,
        Code: document.getElementById('code').value,
        Category: document.getElementById('category').value,
        Address: document.getElementById('address').value,
        PhoneNo: document.getElementById('phoneNo').value
    };

    $.ajax({
        url: 'Hotel/Save',
        method: 'POST',
        data: { hotel: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('hotel-drawer').checked = false;
            loadHotels();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save hotel');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load hotels on page load
    loadHotels();

    // Add hotel button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('hotelTitle').textContent = 'Add Hotel';
        clearForm();
    });

    // Form submit
    document.getElementById('hotelForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveHotel();
    });

    // Search filter
    document.getElementById('searchField').addEventListener('input', filterTable);
});
