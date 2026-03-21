"use strict";

let allTransports = [];

const renderTable = (data) => {
    const tbody = document.getElementById('tableBody');
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-12 text-base-content/50">No transport records found.</td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(t => `
        <tr class="hover:bg-base-200/40 transition-colors">
            <td class="font-medium">${t.name}</td>
            <td>${t.minPAX}</td>
            <td>${t.maxPAX}</td>
            <td class="text-center">
                <div class="flex justify-center gap-1">
                    <button class="btn btn-ghost btn-xs" onclick="openEdit(${t.id})">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button class="btn btn-ghost btn-xs text-error" onclick="confirmDelete(${t.id})">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
    refreshIcons();
};

const filterTable = () => {
    const q = document.getElementById('searchField').value.toLowerCase();
    renderTable(allTransports.filter(t => t.name.toLowerCase().includes(q)));
};

const loadTransports = () => {
    $.ajax({
        url: 'Transport/Get',
        method: 'GET',
        success: (data) => {
            allTransports = data;
            filterTable();
        }
    });
};

const clearForm = () => {
    ['id', 'name', 'minPAX', 'maxPAX'].forEach(f => $(`#${f}`).val(''));
    ['name-error', 'minPAX-error', 'maxPAX-error'].forEach(f => document.getElementById(f).textContent = '');
};

const openAdd = () => {
    clearForm();
    document.getElementById('transportTitle').textContent = 'Add Transport';
    document.getElementById('transport-drawer').checked = true;
    refreshIcons();
};

const openEdit = (id) => {
    const t = allTransports.find(x => x.id === id);
    if (!t) return;
    clearForm();
    document.getElementById('transportTitle').textContent = 'Edit Transport';
    $('#id').val(t.id);
    $('#name').val(t.name);
    $('#minPAX').val(t.minPAX);
    $('#maxPAX').val(t.maxPAX);
    document.getElementById('transport-drawer').checked = true;
    refreshIcons();
};

const confirmDelete = (id) => {
    confirmAction('Are you sure you want to delete this transport?', () => {
        $.ajax({
            url: 'Transport/Delete',
            method: 'POST',
            data: { id },
            success: (data) => {
                Toast.show(data.message, data.type === 'success' ? 'success' : 'error');
                loadTransports();
            }
        });
    });
};

const validate = () => {
    let valid = true;
    const name = $('#name').val().trim();
    const minPAX = $('#minPAX').val().trim();
    const maxPAX = $('#maxPAX').val().trim();

    document.getElementById('name-error').textContent = !name ? 'Name is required.' : '';
    document.getElementById('minPAX-error').textContent = !minPAX ? 'Min PAX is required.' : '';
    document.getElementById('maxPAX-error').textContent = !maxPAX ? 'Max PAX is required.' : '';

    if (!name || !minPAX || !maxPAX) valid = false;
    return valid;
};

$(document).ready(() => {
    loadTransports();

    document.querySelector('label[for="transport-drawer"].drawer-button')?.addEventListener('click', openAdd);

    document.getElementById('searchField').addEventListener('input', filterTable);

    $('#transportForm').on('submit', function (e) {
        e.preventDefault();
        if (!validate()) return;

        const record = {
            Id: $('#id').val(),
            Name: $('#name').val(),
            MinPAX: $('#minPAX').val(),
            MaxPAX: $('#maxPAX').val()
        };

        $.ajax({
            url: 'Transport/Save',
            method: 'POST',
            data: { transport: record },
            success: (data) => {
                Toast.show(data.message, data.type === 'success' ? 'success' : 'error');
                if (data.type === 'success') {
                    document.getElementById('transport-drawer').checked = false;
                    loadTransports();
                }
            }
        });
    });
});
