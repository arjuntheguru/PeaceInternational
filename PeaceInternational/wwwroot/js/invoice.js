"use strict";

let invoicesData = [];
let itemsList = [];

// Function to show toast notification
const showToast = (type, message) => {
    Toast.show(type, message, 3000);
};

// Function to load invoices
const loadInvoices = () => {
    $.ajax({
        url: 'Invoice/GetInvoice',
        method: 'GET',
        success: (data) => {
            invoicesData = data;
            renderTable(data);
        },
        error: () => {
            showToast('error', 'Failed to load invoices');
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
                        <i class="fas fa-file-invoice fa-4x text-base-300"></i>
                        <div>
                            <h3 class="font-bold text-lg">No invoices found</h3>
                            <p class="text-base-content/70">Start by adding your first invoice</p>
                        </div>
                        <label for="invoice-drawer" class="btn btn-primary gap-2 drawer-button">
                            <i class="fas fa-plus"></i>
                            Add Invoice
                        </label>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(invoice => `
        <tr class="hover transition-colors duration-200"
            data-invoice="${invoice.invoiceNo || ''}"
            data-filecode="${(invoice.fileCodeNo || '').toLowerCase()}"
            data-client="${(invoice.clientName || '').toLowerCase()}">
            <td>
                <div class="badge badge-primary badge-lg">${invoice.invoiceNo || '-'}</div>
            </td>
            <td>
                <span class="font-mono text-sm">${invoice.fileCodeNo || '-'}</span>
            </td>
            <td class="font-semibold">${invoice.clientName || '-'}</td>
            <td>
                <div class="badge badge-outline">${invoice.currency || '-'}</div>
            </td>
            <td class="font-bold text-success">${parseFloat(invoice.netAmount || 0).toFixed(2)}</td>
            <td>
                <div class="flex gap-2 justify-center">
                    <button onclick="editInvoice(${invoice.id})" class="btn btn-sm btn-info gap-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="generateInvoice(${invoice.id})" class="btn btn-sm btn-success gap-2" title="View">
                        <i class="fas fa-file-invoice"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Function to filter table
const filterTable = () => {
    const invoiceNo = document.getElementById('searchField').value.toLowerCase();
    const fileCode = document.getElementById('searchFieldFileCode').value.toLowerCase();
    const client = document.getElementById('searchFieldClient').value.toLowerCase();

    const filtered = invoicesData.filter(invoice => {
        const matchInvoice = !invoiceNo || (invoice.invoiceNo || '').toLowerCase().includes(invoiceNo);
        const matchFileCode = !fileCode || (invoice.fileCodeNo || '').toLowerCase().includes(fileCode);
        const matchClient = !client || (invoice.clientName || '').toLowerCase().includes(client);

        return matchInvoice && matchFileCode && matchClient;
    });

    renderTable(filtered);
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
    document.getElementById('fileCodeNo').parentElement.style.display = 'block';

    // Clear error messages
    document.querySelectorAll('.label-text-alt.text-error').forEach(el => el.textContent = '');
};

// Function to render items table
const renderItemsTable = () => {
    const tbody = document.getElementById('itemsTableBody');

    if (itemsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4 text-base-content/50">
                    No items added yet
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
        document.getElementById('dr-error').textContent = 'Dr. is required';
        isValid = false;
    }

    // Currency validation
    const currency = document.getElementById('currency').value.trim();
    if (!currency) {
        document.getElementById('currency-error').textContent = 'Currency is required';
        isValid = false;
    }

    // Client Name validation
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
        document.getElementById('clientName-error').textContent = 'Client name is required';
        isValid = false;
    }

    // Items validation
    if (itemsList.length === 0) {
        showToast('error', 'Please add at least one item');
        isValid = false;
    }

    return isValid;
};

// Function to edit invoice
window.editInvoice = (id) => {
    const invoice = invoicesData.find(inv => inv.id === id);
    if (!invoice) return;

    document.getElementById('invoiceTitle').textContent = 'Edit Invoice';
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
    if (invoice.isTicket) {
        document.getElementById('fileCodeNo').parentElement.style.display = 'none';
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

    // Open drawer
    document.getElementById('invoice-drawer').checked = true;
};

// Function to generate/view invoice
window.generateInvoice = (id) => {
    $.ajax({
        url: 'Invoice/GetInvoiceInfo',
        method: 'GET',
        data: { id: id },
        success: (data) => {
            data.invoice.fileCodeNo = data.invoice.fileCodeNo ? data.invoice.fileCodeNo.split('/')[1] : data.invoice.fileCodeNo;

            var source = document.getElementById("entry-template").innerHTML;
            var template = Handlebars.compile(source);
            var result = template(data);

            document.getElementById('receiptTemplate').innerHTML = result;
            document.getElementById('viewInvoice').showModal();
        },
        error: () => {
            showToast('error', 'Failed to load invoice');
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
            document.getElementById('invoice-drawer').checked = false;
            loadInvoices();
            clearForm();
        },
        error: () => {
            showToast('error', 'Failed to save invoice');
        }
    });
};

// Document ready
$(document).ready(function () {
    // Load invoices on page load
    loadInvoices();

    // Set current date
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);

    // Add invoice button click
    const drawerButton = document.querySelector('label[for="invoice-drawer"]');
    if (drawerButton) {
        drawerButton.addEventListener('click', function() {
            document.getElementById('invoiceTitle').textContent = 'Add Invoice';
            clearForm();
        });
    }

    // Form submit
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveInvoice();
    });

    // Add product button
    document.getElementById('addProduct').addEventListener('click', addItem);

    // Enter key on amount field
    document.getElementById('particularAmount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
        }
    });

    // Discount change
    document.getElementById('discount').addEventListener('input', calcTotal);

    // Is Ticket checkbox
    document.getElementById('isTicket').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('fileCodeNo').parentElement.style.display = 'none';
            document.getElementById('fileCodeNo').value = '';
        } else {
            document.getElementById('fileCodeNo').parentElement.style.display = 'block';
        }
    });

    // File code change - auto fill client data
    document.getElementById('fileCodeNo').addEventListener('change', function() {
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

    // Search filters
    document.getElementById('searchField').addEventListener('input', filterTable);
    document.getElementById('searchFieldFileCode').addEventListener('input', filterTable);
    document.getElementById('searchFieldClient').addEventListener('input', filterTable);

    // Print invoice button
    document.getElementById('printInvoice').addEventListener('click', function() {
        html2canvas(document.getElementById("invoiceBody"), {
            scale: 3
        }).then(function (canvas) {
            var myImage = canvas.toDataURL("image/png");
            var tWindow = window.open("");
            tWindow.document.body.innerHTML = "<img id='Image' src='" + myImage + "' style='width:100%;'></img>";
            tWindow.document.close();
            tWindow.focus();
            tWindow.print();
        });
    });
});
