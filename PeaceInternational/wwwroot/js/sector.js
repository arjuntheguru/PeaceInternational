"use strict";

let sectorsData = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load sectors
const loadSectors = () => {
    $.ajax({
        url: 'Sector/Get',
        method: 'GET',
        success: (data) => {
            sectorsData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load sectors');
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
                        <i class="fas fa-map-marked-alt fa-4x text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No sectors found</h3>
                            <p class="text-base-content/70">Start by adding your first sector</p>
                        </div>
                        <label for="sector-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i class="fas fa-plus"></i>
                            Add Sector
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(sector => {
        const t1 = sector.sectorTransport && sector.sectorTransport[0] ? sector.sectorTransport[0].cost : '0';
        const t2 = sector.sectorTransport && sector.sectorTransport[1] ? sector.sectorTransport[1].cost : '0';
        const t3 = sector.sectorTransport && sector.sectorTransport[2] ? sector.sectorTransport[2].cost : '0';
        const t4 = sector.sectorTransport && sector.sectorTransport[3] ? sector.sectorTransport[3].cost : '0';
        const t5 = sector.sectorTransport && sector.sectorTransport[4] ? sector.sectorTransport[4].cost : '0';
        const t6 = sector.sectorTransport && sector.sectorTransport[5] ? sector.sectorTransport[5].cost : '0';

        return `
            <tr class="hover transition-colors duration-200"
                data-sector-name="${(sector.name || '').toLowerCase()}">
                <td class="font-semibold">${sector.name || '-'}</td>
                <td>
                    <div class="badge badge-outline">${sector.code || '-'}</div>
                </td>
                <td>
                    <div class="badge badge-ghost">${t1}</div>
                </td>
                <td>
                    <div class="badge badge-ghost">${t2}</div>
                </td>
                <td>
                    <div class="badge badge-ghost">${t3}</div>
                </td>
                <td>
                    <div class="badge badge-ghost">${t4}</div>
                </td>
                <td>
                    <div class="badge badge-ghost">${t5}</div>
                </td>
                <td>
                    <div class="badge badge-ghost">${t6}</div>
                </td>
                <td>
                    <div class="flex gap-2 justify-center">
                        <button onclick="editSector(${sector.id})" class="btn btn-sm btn-info gap-2" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteSector(${sector.id})" class="btn btn-sm btn-error gap-2" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

// Function to filter table
const filterTable = () => {
    const searchTerm = document.getElementById('searchField').value.toLowerCase();

    const filtered = sectorsData.filter(sector => {
        return (sector.name || '').toLowerCase().includes(searchTerm);
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('code').value = '';
    document.getElementById('t1cost').value = '';
    document.getElementById('t2cost').value = '';
    document.getElementById('t3cost').value = '';
    document.getElementById('t4cost').value = '';
    document.getElementById('t5cost').value = '';
    document.getElementById('t6cost').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Reset validation
    $('#sectorForm').validate().resetForm();
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Name validation
    const name = document.getElementById('name').value.trim();
    if (!name) {
        document.getElementById('name-error').textContent = 'Sector name is required';
        isValid = false;
    }

    // Code validation
    const code = document.getElementById('code').value.trim();
    if (!code) {
        document.getElementById('code-error').textContent = 'Code is required';
        isValid = false;
    }

    // T1 validation
    const t1cost = document.getElementById('t1cost').value;
    if (!t1cost) {
        document.getElementById('t1cost-error').textContent = 'T1 rate is required';
        isValid = false;
    }

    // T2 validation
    const t2cost = document.getElementById('t2cost').value;
    if (!t2cost) {
        document.getElementById('t2cost-error').textContent = 'T2 rate is required';
        isValid = false;
    }

    // T3 validation
    const t3cost = document.getElementById('t3cost').value;
    if (!t3cost) {
        document.getElementById('t3cost-error').textContent = 'T3 rate is required';
        isValid = false;
    }

    // T4 validation
    const t4cost = document.getElementById('t4cost').value;
    if (!t4cost) {
        document.getElementById('t4cost-error').textContent = 'T4 rate is required';
        isValid = false;
    }

    // T5 validation
    const t5cost = document.getElementById('t5cost').value;
    if (!t5cost) {
        document.getElementById('t5cost-error').textContent = 'T5 rate is required';
        isValid = false;
    }

    // T6 validation
    const t6cost = document.getElementById('t6cost').value;
    if (!t6cost) {
        document.getElementById('t6cost-error').textContent = 'T6 rate is required';
        isValid = false;
    }

    return isValid;
};

// Function to edit sector
window.editSector = (id) => {
    const sector = sectorsData.find(s => s.id === id);
    if (!sector) return;

    document.getElementById('sectorTitle').textContent = 'Edit Sector';
    document.getElementById('id').value = sector.id;
    document.getElementById('name').value = sector.name || '';
    document.getElementById('code').value = sector.code || '';

    // Set transport costs
    if (sector.sectorTransport && sector.sectorTransport.length >= 6) {
        document.getElementById('t1cost').value = sector.sectorTransport[0].cost || '';
        document.getElementById('t2cost').value = sector.sectorTransport[1].cost || '';
        document.getElementById('t3cost').value = sector.sectorTransport[2].cost || '';
        document.getElementById('t4cost').value = sector.sectorTransport[3].cost || '';
        document.getElementById('t5cost').value = sector.sectorTransport[4].cost || '';
        document.getElementById('t6cost').value = sector.sectorTransport[5].cost || '';
    }

    // Open drawer
    document.getElementById('sector-drawer').checked = true;
};

// Function to delete sector
window.deleteSector = (id) => {
    if (!confirm('Are you sure you want to delete this sector?')) {
        return;
    }

    $.ajax({
        url: 'Sector/Delete',
        method: 'POST',
        data: { id: id },
        success: (data) => {
            showToast(data.type, data.message);
            loadSectors();
        },
        error: () => {
            showToast('error', 'Failed to delete sector');
        }
    });
};

// Function to save sector
const saveSector = () => {
    if (!validateForm()) {
        return;
    }

    const sector = {
        Id: document.getElementById('id').value,
        Name: document.getElementById('name').value,
        Code: document.getElementById('code').value
    };

    const sectorTransport = [
        {
            TransportId: 1,
            Cost: document.getElementById('t1cost').value
        },
        {
            TransportId: 2,
            Cost: document.getElementById('t2cost').value
        },
        {
            TransportId: 3,
            Cost: document.getElementById('t3cost').value
        },
        {
            TransportId: 4,
            Cost: document.getElementById('t4cost').value
        },
        {
            TransportId: 5,
            Cost: document.getElementById('t5cost').value
        },
        {
            TransportId: 6,
            Cost: document.getElementById('t6cost').value
        }
    ];

    const record = { sector, sectorTransport };

    $.ajax({
        url: 'Sector/Save',
        method: 'POST',
        data: { sectorDTO: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('sector-drawer').checked = false;
            loadSectors();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save sector');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load data on page load
    loadSectors();

    // Add sector button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('sectorTitle').textContent = 'Add Sector';
        clearForm();
    });

    // Form submit
    document.getElementById('sectorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSector();
    });

    // Search filter
    document.getElementById('searchField').addEventListener('input', filterTable);
});
