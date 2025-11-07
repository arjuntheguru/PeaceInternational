"use strict";

let vouchersData = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load service vouchers
const loadVouchers = () => {
    $.ajax({
        url: 'ServiceVoucher/Get',
        method: 'GET',
        success: (data) => {
            vouchersData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load service vouchers');
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
                        <i class="fas fa-receipt fa-4x text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No service vouchers found</h3>
                            <p class="text-base-content/70">Start by adding your first service voucher</p>
                        </div>
                        <label for="voucher-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i class="fas fa-plus"></i>
                            Add Service Voucher
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(voucher => `
        <tr class="hover transition-colors duration-200"
            data-receipt="${voucher.id}"
            data-filecode="${(voucher.fileCodeNo || '').toLowerCase()}"
            data-hotel="${(voucher.hotel?.name || '').toLowerCase()}"
            data-client="${(voucher.clientName || '').toLowerCase()}">
            <td>
                <div class="badge badge-primary">${voucher.id}</div>
            </td>
            <td class="font-semibold">${voucher.fileCodeNo || '-'}</td>
            <td>${voucher.hotel?.name || '-'}</td>
            <td>${voucher.clientName || '-'}</td>
            <td>
                <div class="flex gap-2 justify-center">
                    <button onclick="generateReceipt(${voucher.id})" class="btn btn-sm btn-accent gap-2" title="View Receipt">
                        <i class="fas fa-clipboard"></i>
                    </button>
                    <button onclick="editVoucher(${voucher.id})" class="btn btn-sm btn-info gap-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Function to filter table
const filterTable = () => {
    const receipt = document.getElementById('searchFieldReceipt').value.toLowerCase();
    const fileCode = document.getElementById('searchFieldFileCode').value.toLowerCase();
    const hotel = document.getElementById('searchFieldHotel').value.toLowerCase();
    const client = document.getElementById('searchFieldClientname').value.toLowerCase();

    const filtered = vouchersData.filter(voucher => {
        const matchReceipt = !receipt || voucher.id.toString().includes(receipt);
        const matchFileCode = !fileCode || (voucher.fileCodeNo || '').toLowerCase().includes(fileCode);
        const matchHotel = !hotel || (voucher.hotel?.name || '').toLowerCase().includes(hotel);
        const matchClient = !client || (voucher.clientName || '').toLowerCase().includes(client);

        return matchReceipt && matchFileCode && matchHotel && matchClient;
    });

    renderTable(filtered);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('fileCodeNo').value = '';
    document.getElementById('hotel').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('pax').value = '';
    document.getElementById('arrivalOn').value = '';
    document.getElementById('from').value = '';
    document.getElementById('arrivalFlight').value = '';
    document.getElementById('departureOn').value = '';
    document.getElementById('to').value = '';
    document.getElementById('departureFlight').value = '';
    document.getElementById('services').value = '';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // File Code validation
    const fileCodeNo = document.getElementById('fileCodeNo').value.trim();
    if (!fileCodeNo) {
        document.getElementById('fileCodeNo-error').textContent = 'File code is required';
        isValid = false;
    }

    // Hotel validation
    const hotel = document.getElementById('hotel').value;
    if (!hotel) {
        document.getElementById('hotel-error').textContent = 'Hotel is required';
        isValid = false;
    }

    // Client Name validation
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
        document.getElementById('clientName-error').textContent = 'Client name is required';
        isValid = false;
    }

    // PAX validation
    const pax = document.getElementById('pax').value.trim();
    if (!pax) {
        document.getElementById('pax-error').textContent = 'PAX is required';
        isValid = false;
    }

    // Arrival date validation
    const arrivalOn = document.getElementById('arrivalOn').value;
    if (!arrivalOn) {
        document.getElementById('arrivalOn-error').textContent = 'Arrival date is required';
        isValid = false;
    }

    // From validation
    const from = document.getElementById('from').value.trim();
    if (!from) {
        document.getElementById('from-error').textContent = 'Origin is required';
        isValid = false;
    }

    // Arrival flight validation
    const arrivalFlight = document.getElementById('arrivalFlight').value.trim();
    if (!arrivalFlight) {
        document.getElementById('arrivalFlight-error').textContent = 'Arrival flight is required';
        isValid = false;
    }

    // Departure date validation
    const departureOn = document.getElementById('departureOn').value;
    if (!departureOn) {
        document.getElementById('departureOn-error').textContent = 'Departure date is required';
        isValid = false;
    } else if (arrivalOn && departureOn < arrivalOn) {
        document.getElementById('departureOn-error').textContent = 'Departure must be after arrival';
        isValid = false;
    }

    // To validation
    const to = document.getElementById('to').value.trim();
    if (!to) {
        document.getElementById('to-error').textContent = 'Destination is required';
        isValid = false;
    }

    // Departure flight validation
    const departureFlight = document.getElementById('departureFlight').value.trim();
    if (!departureFlight) {
        document.getElementById('departureFlight-error').textContent = 'Departure flight is required';
        isValid = false;
    }

    // Services validation
    const services = document.getElementById('services').value.trim();
    if (!services) {
        document.getElementById('services-error').textContent = 'Services are required';
        isValid = false;
    }

    return isValid;
};

// Function to edit voucher
window.editVoucher = (id) => {
    const voucher = vouchersData.find(v => v.id === id);
    if (!voucher) return;

    document.getElementById('serviceVoucherTitle').textContent = 'Edit Service Voucher';
    document.getElementById('id').value = voucher.id;
    document.getElementById('fileCodeNo').value = voucher.fileCodeNo || '';
    document.getElementById('hotel').value = voucher.hotelId || '';
    document.getElementById('clientName').value = voucher.clientName || '';
    document.getElementById('pax').value = voucher.pax || '';
    document.getElementById('arrivalOn').value = voucher.arrivalDate ? voucher.arrivalDate.split('T')[0] : '';
    document.getElementById('from').value = voucher.from || '';
    document.getElementById('arrivalFlight').value = voucher.arrivalFlight || '';
    document.getElementById('departureOn').value = voucher.departureDate ? voucher.departureDate.split('T')[0] : '';
    document.getElementById('to').value = voucher.to || '';
    document.getElementById('departureFlight').value = voucher.departureFlight || '';
    document.getElementById('services').value = voucher.services || '';

    // Open drawer
    document.getElementById('voucher-drawer').checked = true;
};

// Function to generate receipt
window.generateReceipt = (id) => {
    $.ajax({
        url: 'ServiceVoucher/GetServiceVoucher',
        method: 'GET',
        data: { id: id },
        success: (data) => {
            data.serviceVoucher.exchangeOrderNo = data.serviceVoucher.exchangeOrderNo.split('/')[1];
            data.serviceVoucher.fileCodeNo = data.serviceVoucher.fileCodeNo.split('/')[1];

            var source = document.getElementById("entry-template").innerHTML;
            var template = Handlebars.compile(source);
            var result = template(data);

            $('#receiptTemplate1').html(result);
            $('#receiptTemplate2').html(result);

            // Open Daisy UI modal
            document.getElementById('viewReceipt').showModal();
        },
        error: () => {
            showToast('error', 'Failed to load receipt');
        }
    });
};

// Function to save voucher
const saveVoucher = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        FileCodeNo: document.getElementById('fileCodeNo').value,
        HotelId: document.getElementById('hotel').value,
        ClientName: document.getElementById('clientName').value,
        PAX: document.getElementById('pax').value,
        ArrivalDate: document.getElementById('arrivalOn').value,
        From: document.getElementById('from').value,
        ArrivalFlight: document.getElementById('arrivalFlight').value,
        DepartureDate: document.getElementById('departureOn').value,
        To: document.getElementById('to').value,
        DepartureFlight: document.getElementById('departureFlight').value,
        Services: document.getElementById('services').value
    };

    $.ajax({
        url: 'ServiceVoucher/Save',
        method: 'POST',
        data: { serviceVoucher: record },
        success: (data) => {
            showToast(data.type, data.message);
            document.getElementById('voucher-drawer').checked = false;
            loadVouchers();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save service voucher');
        }
    });
};

// Function to load hotels dropdown
const loadHotels = () => {
    $.ajax({
        url: 'Hotel/Get',
        method: 'GET',
        success: (data) => {
            let options = "";
            for (var i = 0; i < data.length; i++) {
                options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
            }
            $('#hotel').append(options);
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load data on page load
    loadVouchers();
    loadHotels();

    // Set current date
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);

    // Add voucher button click
    document.querySelector('.drawer-button').addEventListener('click', function() {
        document.getElementById('serviceVoucherTitle').textContent = 'Add Service Voucher';
        clearForm();
    });

    // Form submit
    document.getElementById('serviceVoucherForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveVoucher();
    });

    // Search filters
    document.getElementById('searchFieldReceipt').addEventListener('input', filterTable);
    document.getElementById('searchFieldFileCode').addEventListener('input', filterTable);
    document.getElementById('searchFieldHotel').addEventListener('input', filterTable);
    document.getElementById('searchFieldClientname').addEventListener('input', filterTable);

    // Print invoice button
    $('#printInvoice').on('click', function () {
        html2canvas($("#invoiceBody")[0], {
            scale: 3
        }).then(function (canvas) {
            var myImage = canvas.toDataURL("image/png");
            var tWindow = window.open("");
            $(tWindow.document.body)
                .html("<img id='Image' src=" + myImage + " style='width:100%;'></img>")
                .ready(function () {
                    tWindow.focus();
                    tWindow.print();
                });
        });
    });

    // Auto-fill from customer data when file code changes
    $('#fileCodeNo').on('change', function () {
        $.ajax({
            url: 'Customer/Get',
            method: 'GET',
            data: { fileCodeNo: $('#fileCodeNo').val() },
            success: function (data) {
                $('#clientName').val(data.tourName);
                $('#arrivalOn').val(data.arrivalDate.split('T')[0]);
                $('#departureOn').val(data.departureDate.split('T')[0]);
            }
        });
    });
});
