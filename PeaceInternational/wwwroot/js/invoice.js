﻿"use strict";

//Column defination for InvoiceInfo Grid
const invoiceColumnDefs = [

    { headerName: 'Invoice No', field: 'invoiceNo', maxWidth: 150 },
    {
        headerName: 'Date', field: 'createdDate', tooltipField: 'Date', maxWidth: 220,
        cellRenderer: function (data) {
            return data.value.split('T')[0];
        }
    },
    { headerName: 'Agent Name', field: 'agentName', maxWidth: 150 },
    { headerName: 'Client Name', field: 'clientName', maxWidth: 150 },
    //{ headerName: 'Currency', field: 'currency', maxWidth: 150 },
    { headerName: 'PAX', field: 'pax', maxWidth: 100 },
    //{ headerName: 'Total Due', field: 'totalDue', maxWidth: 100 },
    //{ headerName: 'Discount', field: 'discount', maxWidth: 80 },
    { headerName: 'Net Amount', field: 'netAmount', maxWidth: 140 },
    {
        headerName: 'Details', maxWidth: 100,
        cellRenderer: function () {
            return '<i class="btn fas fa-clipboard" id="detailsButton"></i>';
        },
        onCellClicked(params) {           
            InvoiceDetails(params.data.id);
        }
    },
    {
        headerName: 'Edit', maxWidth: 100,       
        cellRenderer: function () {
            return '<i class="btn fas fa-edit" id="editButton"></i>';
        },
        onCellClicked(params) {            
            Edit(params.data);
        }
    },
    {
        headerName: 'Invoice', maxWidth: 100,
        cellRenderer: function () {
            return '<i class="btn fas fa-file-invoice-dollar" id="generatePdfButton"></i>';
        },
        onCellClicked(params) {            
            GenerateInvoice(params.data);
        }
    }
];


//Column defination for InvoiceDetails Grid
const invoiceDetailColumnDefs = [

    { headerName: 'Particulars', field: 'particulars' },
    { headerName: 'Amount', field: 'amount', maxWidth:200 }

];

//Function to set the data for the Invoice grid
const setInvoiceGridData = () => {

    $.ajax({
        url: 'Invoice/GetInvoice',
        method: 'GET',
        success: (data) => {
            gridOptions.api.setRowData(data);          
        }
    });
};


//Function to set the data for the Invoice Detail grid
const setInvoiceDetailGridData = (invoiceId, callback) => {   
    $.ajax({
        url: 'Invoice/GetInvoiceDetail',
        method: 'GET',
        data: { invoiceId: invoiceId },
        success: (data) => {
            invoiceDetailGridOptions.api.setRowData(data);         
            callback(data);
        }
    });
};

//Settings for the Invoice grid
const gridOptions = {
    columnDefs: invoiceColumnDefs,
    rowHeight: 40,
    defaultColDef: {
        sortable: true,
        filter: true
    },
    paginationAutoPageSize: true,
    pagination: true,
    accentedSort: true,
    enableBrowserTooltips: true,
    onGridSizeChanged: (params) => {
        params.api.sizeColumnsToFit();
    }
};

//Settings for the Invoice Detail grid
const invoiceDetailGridOptions = {
    columnDefs: invoiceDetailColumnDefs,
    rowHeight: 40,
    defaultColDef: {
        sortable: true,
        filter: true
    },
    paginationAutoPageSize: true,
    pagination: true,
    accentedSort: true,
    onGridSizeChanged: (params) => {
        params.api.sizeColumnsToFit();
    }
};

//Function to generate Invoice
const GenerateInvoice = (invoiceData) => {
  
    $.ajax({
        url: 'Invoice/GetInvoiceInfo',
        method: 'GET',
        data: { id: invoiceData.id },
        success: (data) => {            
        
            var source = document.getElementById("entry-template").innerHTML;
            var template = Handlebars.compile(source);
            var result = template(data);
         
            $('#receiptTemplate').html(result);            
            $('#viewInvoice').modal('toggle');
        }
    });
   
};


//Invoice Details
const InvoiceDetails = (invoiceId) => {

    $('#invoiceDetailModal').modal('toggle');
    setInvoiceDetailGridData(invoiceId, () => { });

};

const itemListColumnDefs = [
   
    {
        headerName: 'Particulars', field: 'particulars', width: 450,
        cellStyle: () => {
            return { 'font-size': '16px' };
        },
        cellClass:['text-monospace']
    },  
    {
        headerName: 'Amount', field: 'amount', width: 250,
        cellStyle: () => {
            return { 'font-size': '16px' };
        },
        cellClass: ['text-monospace']
    },
    {
        headerName: 'Remove', width: 150,
        cellRenderer: () => {
            return `<button type='button' class='btn btn-danger btn-sm m-1 shadow w-100'><i class='fas fa-times'></i></button>`;
        },
        onCellClicked(params) {

            itemListGridOptions.api.updateRowData({ remove: [params.data] });
            calcTotal();
        }
    }
];

const itemListGridOptions = {

    columnDefs: itemListColumnDefs,
    rowHeight: 50,
    rowData: false   
};

function getItemList() {

    let itemList = [];
    itemListGridOptions.api.forEachNode(function (node) {
        itemList.push(node.data);
    });
    
    return itemList;
}

function clear() {

    $('#particulars').val('');
    $('#particularAmount').val('');
}

function call() {

   let filter = {
        invoiceNo: { type: 'contains', filter: $('#searchField').val() },
        agentName: { type: 'contains', filter: $('#searchFieldAgent').val() },
        clientName: { type: 'contains', filter: $('#searchFieldClient').val() }
    };
        gridOptions.api.setFilterModel(filter);
        gridOptions.api.onFilterChanged();
}

const Edit = (data) => {
    
    $('#createInvoice').modal('toggle');
    $("#id").val(data.id);
    $('#date').val(data.createdDate.split('T')[0]);
    $('#referenceNo').val(data.referenceNo);
    $('#dr').val(data.dr);
    $('#agentName').val(data.agentName);
    $('#currency').val(data.currency);
    $('#clientName').val(data.clientName);
    $('#pax').val(data.pax);
    $('#guide').val(data.guide);
    $('#vehicle').val(data.vehicle);
    $('#totalDue').val(data.totalDue);
    $('#discount').val(data.discount);
    $('#netAmount').val(data.netAmount);
    setInvoiceDetailGridData(data.id, setItemListData);
};

const setItemListData = (data) => {    
    itemListGridOptions.api.setRowData(data);
};



const ClearInvoiceForm = () => {

    removeBorderClass();
    $("#id").val('');    
    $('#date').val(new Date().toISOString().slice(0, 10));
    $('#referenceNo').val('');
    $('#dr').val('');
    $('#agentName').val('');
    $('#currency').val('');
    $('#clientName').val('');
    $('#pax').val('');
    $('#guide').val('');
    $('#vehicle').val('');
    $('#totalDue').val('');
    $('#discount').val('');
    $('#netAmount').val('');
    itemListGridOptions.api.setRowData([]);
};


const invoiceFormValidation = () => {

    $('#invoiceForm').validate({
        rules: {           
            date: {
                required: true
            },
            dr: {
                required: true                
            },
            referenceNo: {
                required: true
            },
            agentName: {
                required: true
            },
            currency: {
                required: true
            },
            clientName: {
                required: true
            },
            pax: {
                required: true
            }
        }
    });
};

const addParticularsValidation = () => {

    if ($('#particulars').val()) {
        if ($('#particularAmount').val()) {
            addParticulars();
        }
        else {
            noty({
                type: 'error',
                text: 'Amount cannot be empty',
                layout: 'center',
                timeout: 1000,
                killer: true
            });
        }
    }
    else {
        noty({
            type: 'error',
            text: 'Particulars cannot be empty',
            layout: 'center',
            timeout: 1000,
            killer: true
        });
    }
};

const addParticulars = () => {

    const newData = {      
        
        particulars: $('#particulars').val(),
        amount: parseInt($('#particularAmount').val())
    };

    itemListGridOptions.api.updateRowData({ add: [newData] });
    calcTotal();
    clear();
};

function calcTotal() {

    let itemList = getItemList();
    let amount = 0;
    let discount = $('#discount').val();
    let netAmount = 0;

    $(itemList).each(function (idx, item) {        
        amount += item.amount;
    });

    netAmount = amount - discount;
    if ($('#discount').val() > amount) {
        $('#discount').addClass('is-invalid');
    }
    else {
        $('#discount').removeClass('is-invalid');
    }

    $('#totalDue').val(amount);
    $('#netAmount').val(netAmount);
    console.log(amount, netAmount);
    return [amount, netAmount];

}

const getItemListData = () => {

    let itemList = [];
    itemListGridOptions.api.forEachNode(function (node) {
        itemList.push(node.data);
    });
    return itemList;
};

const getCurrentNepaliYear = () => {

    var year = new Date().getFullYear();
    const startingNepaliYear = calendarFunctions.getBsYearByAdDate(year, 1, 1);
    const endingNepaliYear = calendarFunctions.getBsYearByAdDate(year, 12, 31);   
    var invoiceNoPrefix = startingNepaliYear.toString().slice(2, 4) + endingNepaliYear.toString().slice(2, 4)
    return invoiceNoPrefix;
};

const Save = () => {

    $('#invoiceForm').off('submit').on('submit', function (e) {

        e.preventDefault();
        
        var record = {
            Id: $('#id').val(),
            InvoiceNo: getCurrentNepaliYear(),
            //FileCodeNo: $('#fileCodeNo').val(),
            ReferenceNo: $('#referenceNo').val(),
            Dr: $('#dr').val(),
            AgentName: $('#agentName').val(),
            Currency: $('#currency').val(),
            ClientName: $('#clientName').val(),
            PAX: $('#pax').val(),
            Guide: $('#guide').val(),
            Vehicle: $('#vehicle').val(),
            TotalDue: $('#totalDue').val(),
            Discount: $('#discount').val(),
            NetAmount: $('#netAmount').val(),
            InvoiceDetails: getItemListData()
        };              

        $.ajax({
            url: 'Invoice/Save',
            method: 'POST',
            data: { invoice: record },
            success: function (data) {             
                noty({
                    type: data.type,
                    text: data.message,
                    layout: 'topCenter',
                    timeout: 2000
                });
                $('#createInvoice').modal('toggle');
                setInvoiceGridData();
            }
        });

    });
};

$(document).ready(function () {

    var invoiceGrid = document.querySelector('#invoiceGrid');
    new agGrid.Grid(invoiceGrid, gridOptions);

    var itemDetailsGrid = document.querySelector('#invoiceDetailsGrid');
    new agGrid.Grid(itemDetailsGrid, invoiceDetailGridOptions);

    setInvoiceGridData();

    var itemListGrid = document.querySelector('#itemListGrid');
    new agGrid.Grid(itemListGrid, itemListGridOptions);

    $('#addProduct').on('click', function () {
        addParticularsValidation();
    });

    $('#currency').on('keyup', () => {
        $('.currency').html($('#currency').val());
    });

    $('#discount').on('keyup', () => { calcTotal(); });

    getCurrentNepaliYear();

    $('#addInvoiceBtn').click(function () {             
        ClearInvoiceForm();
        $('#invoiceForm').validate().destroy();
        invoiceFormValidation();
        $('#invoiceForm').validate().resetForm();
    });

    $('#btnSave').off('click').on('click', function () {
        if ($('#invoiceForm').valid()) {
            Save();
        }
    });

    $('#printInvoice').off('click').on('click', function () {

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
       
      
        //html2canvas($("#invoiceBody")[0]).then(function (canvas) {
        //    var img = canvas.toDataURL();
        //    window.open(img);
        //});
      
        //$('#invoiceBody').html2canvas();
        //var queue = html2canvas.Parse();
        //var canvas = html2canvas.Renderer(queue, { elements: { length: 1 } });
        //var img = canvas.toDataURL();
        //window.open(img);
    });

    $('#searchField').on('keyup', function ()
    {
        call();
    });

    $('#searchFieldAgent').on('keyup', function ()
    {
        call();
    });

    $('#searchFieldClient').on('keyup', function ()
    {
        call();
    });
});


