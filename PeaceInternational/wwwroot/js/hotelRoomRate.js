"use strict";

let roomRatesData = [];
let hotelsData = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load room rates
const loadRoomRates = () => {
    $.ajax({
        url: 'HotelRoomRate/Get',
        method: 'GET',
        success: (data) => {
            roomRatesData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load room rates');
        }
    });
};

// Function to load hotels for dropdown
const loadHotels = () => {
    $.ajax({
        url: 'Hotel/Get',
        method: 'GET',
        success: function (data) {
            hotelsData = data;
            let options = "";
            for (var i = 0; i < data.length; i++) {
                options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
            }
            $('#hotel').append(options);
        }
    });
};

// Function to render table
const renderTable = (data) => {
    const tableBody = document.getElementById('tableBody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12">
                    <div class="flex flex-col items-center gap-4">
                        <i class="fas fa-bed fa-4x text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No room rates found</h3>
                            <p class="text-base-content/70">Start by adding your first room rate</p>
                        </div>
                        <label for="roomrate-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i class="fas fa-plus"></i>
                            Add Room Rate
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(rate => `
        <tr class="hover transition-colors duration-200"
            data-hotel-name="${(rate.hotel?.name || '').toLowerCase()}">
            <td class="font-semibold">${rate.hotel?.name || '-'}</td>
            <td>
                <div class="badge badge-outline">${rate.singleBed || '0'}</div>
            </td>
            <td>
                <div class="badge badge-outline">${rate.doubleBed || '0'}</div>
            </td>
            <td>
                <div class="badge badge-outline">${rate.extraBed || '0'}</div>
            </td>
            <td>
                <div class="badge badge-primary">${rate.ap || '0'}</div>
            </td>
            <td>
                <div class="badge badge-secondary">${rate.map || '0'}</div>
            </td>
            <td>
                <div class="flex gap-2 justify-center">
                    <button onclick="editRoomRate(${rate.id})" class="btn btn-sm btn-info gap-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRoomRate(${rate.id})" class="btn btn-sm btn-error gap-2" title="Delete">
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

    const filtered = roomRatesData.filter(rate => {
        return (rate.hotel?.name || '').toLowerCase().includes(searchTerm);
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('hotel').value = '';
    document.getElementById('singleBed').value = '';
    document.getElementById('doubleBed').value = '';
    document.getElementById('extraBed').value = '';
    document.getElementById('ap').value = '';
    document.getElementById('map').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Reset validation
    $('#hotelRoomRateForm').validate().resetForm();
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Hotel validation
    const hotel = document.getElementById('hotel').value;
    if (!hotel) {
        document.getElementById('hotel-error').textContent = 'Hotel is required';
        isValid = false;
    }

    // Single Bed validation
    const singleBed = document.getElementById('singleBed').value;
    if (!singleBed) {
        document.getElementById('singleBed-error').textContent = 'Single bed rate is required';
        isValid = false;
    }

    // Double Bed validation
    const doubleBed = document.getElementById('doubleBed').value;
    if (!doubleBed) {
        document.getElementById('doubleBed-error').textContent = 'Double bed rate is required';
        isValid = false;
    }

    // Extra Bed validation
    const extraBed = document.getElementById('extraBed').value;
    if (!extraBed) {
        document.getElementById('extraBed-error').textContent = 'Extra bed rate is required';
        isValid = false;
    }

    // AP validation
    const ap = document.getElementById('ap').value;
    if (!ap) {
        document.getElementById('ap-error').textContent = 'AP rate is required';
        isValid = false;
    }

    // MAP validation
    const map = document.getElementById('map').value;
    if (!map) {
        document.getElementById('map-error').textContent = 'MAP rate is required';
        isValid = false;
    }

    return isValid;
};

// Function to edit room rate
window.editRoomRate = (id) => {
    const rate = roomRatesData.find(r => r.id === id);
    if (!rate) return;

    document.getElementById('roomrateTitle').textContent = 'Edit Room Rate';
    document.getElementById('id').value = rate.id;
    document.getElementById('hotel').value = rate.hotelId || '';
    document.getElementById('singleBed').value = rate.singleBed || '';
    document.getElementById('doubleBed').value = rate.doubleBed || '';
    document.getElementById('extraBed').value = rate.extraBed || '';
    document.getElementById('ap').value = rate.ap || '';
    document.getElementById('map').value = rate.map || '';

    // Open drawer
    document.getElementById('roomrate-drawer').checked = true;
};

// Function to delete room rate
window.deleteRoomRate = (id) => {
    if (!confirm('Are you sure you want to delete this room rate?')) {
        return;
    }

    $.ajax({
        url: 'HotelRoomRate/Delete',
        method: 'POST',
        data: { id: id },
        success: (data) => {
            showToast(data.type, data.message);
            loadRoomRates();
        },
        error: () => {
            showToast('error', 'Failed to delete room rate');
        }
    });
};

// Function to save room rate
const saveRoomRate = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        HotelId: document.getElementById('hotel').value,
        SingleBed: document.getElementById('singleBed').value,
        DoubleBed: document.getElementById('doubleBed').value,
        ExtraBed: document.getElementById('extraBed').value,
        AP: document.getElementById('ap').value,
        MAP: document.getElementById('map').value
    };

    $.ajax({
        url: 'HotelRoomRate/Save',
        method: 'POST',
        data: { hotelRoomRate: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('roomrate-drawer').checked = false;
            loadRoomRates();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save room rate');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load data on page load
    loadRoomRates();
    loadHotels();

    // Add room rate button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('roomrateTitle').textContent = 'Add Room Rate';
        clearForm();
    });

    // Form submit
    document.getElementById('hotelRoomRateForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveRoomRate();
    });

    // Search filter
    document.getElementById('searchField').addEventListener('input', filterTable);
});
