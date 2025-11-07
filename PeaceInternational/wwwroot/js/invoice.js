"use strict";

let invoicesData = [];
let itemsList = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to clear form
const clearForm = () => {
    document.getElementById('id').value = '';
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('dr').value = '';
    document.getElementById('currency').value = '';
    document.getElementById('referenceNo').value = '';
    document.getElementById('fileCodeNo').value = '';
    document.getElementById('isTicket').checked = false;
    document.getElementById('address').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('pax').value = '';
    document.getElementById('guide').value = '';
    document.getElementById('vehicle').value = '';
    document.getElementById('particulars').value = '';
    document.getElementById('particularAmount').value = '';
    document.getElementById('discount').value = '0';
    document.getElementById('totalDue').value = '0.00';
    document.getElementById('netAmount').value = '0.00';

    // Clear items list
    itemsList = [];
    renderItemsTable();

    // Show file code field
    const fileCodeParent = document.getElementById('fileCodeNo').closest('.form-control');
    if (fileCodeParent) fileCodeParent.style.display = 'block';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

// Function to render items table
const renderItemsTable = () => {
    const tbody = document.getElementById('itemsTableBody');

    if (itemsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-8 text-base-content/50">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p>No items added yet</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = itemsList.map((item, index) => `
        <tr class="hover">
            <td>${item.particulars}</td>
            <td class="text-right font-mono">${parseFloat(item.amount).toFixed(2)}</td>
            <td class="text-center">
                <button type="button" onclick="removeItem(${index})" class="btn btn-xs btn-error btn-circle">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');

    calcTotal();
};

// Function to add item
const addItem = () => {
    const particulars = document.getElementById('particulars').value.trim();
    const amount = document.getElementById('particularAmount').value;

    if (!particulars) {
        showToast('error', 'Particulars cannot be empty');
        return;
    }

    if (!amount || parseFloat(amount) <= 0) {
        showToast('error', 'Amount must be greater than 0');
        return;
    }

    itemsList.push({
        id: 0,
        particulars: particulars,
        amount: parseFloat(amount)
    });

    document.getElementById('particulars').value = '';
    document.getElementById('particularAmount').value = '';

    renderItemsTable();
};

// Function to remove item
window.removeItem = (index) => {
    itemsList.splice(index, 1);
    renderItemsTable();
};

// Function to calculate totals
const calcTotal = () => {
    const total = itemsList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const netAmount = total - discount;

    document.getElementById('totalDue').value = total.toFixed(2);
    document.getElementById('netAmount').value = netAmount.toFixed(2);
};

// Function to validate form
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');

    // Dr validation
    const dr = document.getElementById('dr').value.trim();
    if (!dr) {
        const drError = document.getElementById('dr-error');
        if (drError) drError.textContent = 'Dr. is required';
        isValid = false;
    }

    // Currency validation
    const currency = document.getElementById('currency').value.trim();
    if (!currency) {
        const currencyError = document.getElementById('currency-error');
        if (currencyError) currencyError.textContent = 'Currency is required';
        isValid = false;
    }

    // Client Name validation
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
        const clientNameError = document.getElementById('clientName-error');
        if (clientNameError) clientNameError.textContent = 'Client name is required';
        isValid = false;
    }

    // Items validation
    if (itemsList.length === 0) {
        showToast('error', 'Please add at least one item');
        isValid = false;
    }

    return isValid;
};

// Function to edit invoice (load data for editing)
window.editInvoice = (id) => {
    $.ajax({
        url: 'Invoice/GetInvoice',
        method: 'GET',
        data: { id: id },
        success: (data) => {
            if (!data || data.length === 0) return;

            const invoice = data[0];
            document.getElementById('id').value = invoice.id;
            document.getElementById('date').value = invoice.createdDate ? invoice.createdDate.split('T')[0] : '';
            document.getElementById('dr').value = invoice.dr || '';
            document.getElementById('currency').value = invoice.currency || '';
            document.getElementById('referenceNo').value = invoice.referenceNo || '';
            document.getElementById('fileCodeNo').value = invoice.fileCodeNo || '';
            document.getElementById('isTicket').checked = invoice.isTicket || false;
            document.getElementById('address').value = invoice.address || '';
            document.getElementById('clientName').value = invoice.clientName || '';
            document.getElementById('pax').value = invoice.pax || '';
            document.getElementById('guide').value = invoice.guide || '';
            document.getElementById('vehicle').value = invoice.vehicle || '';
            document.getElementById('discount').value = invoice.discount || '0';
            document.getElementById('totalDue').value = parseFloat(invoice.totalDue || 0).toFixed(2);
            document.getElementById('netAmount').value = parseFloat(invoice.netAmount || 0).toFixed(2);

            // Toggle file code field
            const fileCodeParent = document.getElementById('fileCodeNo').closest('.form-control');
            if (invoice.isTicket && fileCodeParent) {
                fileCodeParent.style.display = 'none';
            }

            // Load invoice details
            $.ajax({
                url: 'Invoice/GetInvoiceDetail',
                method: 'GET',
                data: { invoiceId: id },
                success: (data) => {
                    itemsList = data.map(item => ({
                        id: item.id,
                        particulars: item.particulars,
                        amount: parseFloat(item.amount)
                    }));
                    renderItemsTable();
                }
            });
        }
    });
};

// Function to save invoice
const saveInvoice = () => {
    if (!validateForm()) {
        return;
    }

    const record = {
        Id: document.getElementById('id').value,
        IsTicket: document.getElementById('isTicket').checked,
        FileCodeNo: document.getElementById('fileCodeNo').value,
        ReferenceNo: document.getElementById('referenceNo').value,
        Dr: document.getElementById('dr').value,
        Address: document.getElementById('address').value,
        Currency: document.getElementById('currency').value,
        ClientName: document.getElementById('clientName').value,
        PAX: document.getElementById('pax').value,
        Guide: document.getElementById('guide').value,
        Vehicle: document.getElementById('vehicle').value,
        TotalDue: document.getElementById('totalDue').value,
        Discount: document.getElementById('discount').value,
        NetAmount: document.getElementById('netAmount').value,
        InvoiceDetails: itemsList
    };

    $.ajax({
        url: 'Invoice/Save',
        method: 'POST',
        data: { invoice: record },
        success: (data) => {
            showToast(data.type, data.message);
            // Redirect back to Index page after save
            setTimeout(() => {
                window.location.href = '/Invoice/Index';
            }, 1500);
        },
        error: () => {
            showToast('error', 'Failed to save invoice');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Set current date
    const dateField = document.getElementById('date');
    if (dateField) {
        dateField.value = new Date().toISOString().slice(0, 10);
    }

    // Form submit
    const form = document.getElementById('invoiceForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveInvoice();
        });
    }

    // Add product button
    const addProductBtn = document.getElementById('addProduct');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addItem);
    }

    // Enter key on amount field
    const amountField = document.getElementById('particularAmount');
    if (amountField) {
        amountField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
            }
        });
    }

    // Discount change
    const discountField = document.getElementById('discount');
    if (discountField) {
        discountField.addEventListener('input', calcTotal);
    }

    // Is Ticket checkbox
    const isTicketCheckbox = document.getElementById('isTicket');
    if (isTicketCheckbox) {
        isTicketCheckbox.addEventListener('change', function() {
            const fileCodeParent = document.getElementById('fileCodeNo').closest('.form-control');
            if (fileCodeParent) {
                if (this.checked) {
                    fileCodeParent.style.display = 'none';
                    document.getElementById('fileCodeNo').value = '';
                } else {
                    fileCodeParent.style.display = 'block';
                }
            }
        });
    }

    // File code change - auto fill client data
    const fileCodeField = document.getElementById('fileCodeNo');
    if (fileCodeField) {
        fileCodeField.addEventListener('change', function() {
            const fileCode = this.value;
            if (fileCode) {
                $.ajax({
                    url: 'Customer/Get',
                    method: 'GET',
                    data: { fileCodeNo: fileCode },
                    success: function(data) {
                        document.getElementById('clientName').value = data.tourName || '';
                        document.getElementById('guide').value = data.guideName || '';
                    }
                });
            }
        });
    }
});
