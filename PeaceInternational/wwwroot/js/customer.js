"use strict";

let customersData = [];

// Function to show toast notification
const showToast = (type, message) => {
    const toastContainer = document.getElementById('toastContainer');
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';

    const toast = document.createElement('div');
    toast.className = `alert ${alertClass} shadow-lg`;
    toast.innerHTML = `
        <div>
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};

// Function to load customer data
const loadCustomers = () => {
    $.ajax({
        url: 'Customer/Get',
        method: 'GET',
        success: (data) => {
            customersData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load customers');
        }
    });
};

// Function to render table
const renderTable = (data) => {
    const tableBody = document.getElementById('tableBody');

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-12">
                    <div class="flex flex-col items-center gap-4">
                        <i class="fas fa-users fa-4x text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No customers found</h3>
                            <p class="text-base-content/70">Start by adding your first customer</p>
                        </div>
                        <label for="customer-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i class="fas fa-plus"></i>
                            Add Customer
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(customer => `
        <tr class="hover transition-colors duration-200"
            data-file-code="${customer.fileCodeNo || ''}"
            data-tour-name="${(customer.tourName || '').toLowerCase()}"
            data-agent="${(customer.agent || '').toLowerCase()}">
            <td class="font-semibold">${customer.fileCodeNo || '-'}</td>
            <td>
                <div class="font-medium">${customer.tourName || '-'}</div>
            </td>
            <td>
                <div class="badge badge-outline">${customer.country || '-'}</div>
            </td>
            <td>
                <div class="flex items-center gap-2">
                    <i class="fas fa-plane-arrival text-primary text-xs"></i>
                    <span class="text-sm">${customer.arrivalDate ? new Date(customer.arrivalDate).toLocaleDateString() : '-'}</span>
                </div>
            </td>
            <td>
                <div class="flex items-center gap-2">
                    <i class="fas fa-plane-departure text-secondary text-xs"></i>
                    <span class="text-sm">${customer.departureDate ? new Date(customer.departureDate).toLocaleDateString() : '-'}</span>
                </div>
            </td>
            <td>${customer.agent || '-'}</td>
            <td>${customer.agentStaff || '-'}</td>
            <td>${customer.guideName || '-'}</td>
            <td>
                <div class="flex gap-2 justify-center">
                    <button onclick="editCustomer(${customer.id})" class="btn btn-sm btn-info gap-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Function to filter table
const filterTable = () => {
    const fileCodeFilter = document.getElementById('searchFieldFileCode').value.toLowerCase();
    const tourNameFilter = document.getElementById('searchFieldTourName').value.toLowerCase();
    const agentFilter = document.getElementById('searchFieldAgent').value.toLowerCase();

    const filtered = customersData.filter(customer => {
        const matchesFileCode = !fileCodeFilter || (customer.fileCodeNo || '').toLowerCase().includes(fileCodeFilter);
        const matchesTourName = !tourNameFilter || (customer.tourName || '').toLowerCase().includes(tourNameFilter);
        const matchesAgent = !agentFilter || (customer.agent || '').toLowerCase().includes(agentFilter);

        return matchesFileCode && matchesTourName && matchesAgent;
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('tourName').value = '';
    document.getElementById('country').value = '';
    document.getElementById('arrivalDate').value = '';
    document.getElementById('departureDate').value = '';
    document.getElementById('agent').value = '';
    document.getElementById('agentStaff').value = '';
    document.getElementById('guideName').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Reset validation
    $('#customerForm').validate().resetForm();
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Tour Name validation
    const tourName = document.getElementById('tourName').value.trim();
    if (!tourName) {
        document.getElementById('tourName-error').textContent = 'Tour name is required';
        isValid = false;
    }

    // Country validation
    const country = document.getElementById('country').value.trim();
    if (!country) {
        document.getElementById('country-error').textContent = 'Country is required';
        isValid = false;
    }

    // Date validation
    const arrivalDate = document.getElementById('arrivalDate').value;
    const departureDate = document.getElementById('departureDate').value;

    if (arrivalDate && departureDate) {
        if (new Date(arrivalDate) > new Date(departureDate)) {
            document.getElementById('arrivalDate-error').textContent = 'Arrival date must be before departure date';
            isValid = false;
        }
    }

    return isValid;
};

// Function to edit customer
window.editCustomer = (id) => {
    const customer = customersData.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('customerTitle').textContent = 'Edit Customer';
    document.getElementById('id').value = customer.id;
    document.getElementById('tourName').value = customer.tourName || '';
    document.getElementById('country').value = customer.country || '';
    document.getElementById('arrivalDate').value = customer.arrivalDate ? customer.arrivalDate.split('T')[0] : '';
    document.getElementById('departureDate').value = customer.departureDate ? customer.departureDate.split('T')[0] : '';
    document.getElementById('agent').value = customer.agent || '';
    document.getElementById('agentStaff').value = customer.agentStaff || '';
    document.getElementById('guideName').value = customer.guideName || '';

    // Open drawer
    document.getElementById('customer-drawer').checked = true;
};

// Function to save customer
const saveCustomer = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        TourName: document.getElementById('tourName').value,
        Country: document.getElementById('country').value,
        ArrivalDate: document.getElementById('arrivalDate').value,
        DepartureDate: document.getElementById('departureDate').value,
        Agent: document.getElementById('agent').value,
        AgentStaff: document.getElementById('agentStaff').value,
        GuideName: document.getElementById('guideName').value
    };

    $.ajax({
        url: 'Customer/Save',
        method: 'POST',
        data: { customer: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('customer-drawer').checked = false;
            loadCustomers();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save customer');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load customers on page load
    loadCustomers();

    // Add customer button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('customerTitle').textContent = 'Add Customer';
        clearForm();
    });

    // Form submit
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCustomer();
    });

    // Search filters
    document.getElementById('searchFieldFileCode').addEventListener('input', filterTable);
    document.getElementById('searchFieldTourName').addEventListener('input', filterTable);
    document.getElementById('searchFieldAgent').addEventListener('input', filterTable);
});
