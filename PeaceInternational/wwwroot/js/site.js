// Re-initialize Lucide icons after dynamic DOM updates
window.refreshIcons = function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// Escape HTML to prevent XSS in innerHTML interpolation
window.escapeHtml = function(str) {
    if (str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};

// Reusable confirm dialog (replaces native confirm())
window.confirmAction = function(message, onConfirm, title) {
    title = title || 'Confirm Delete';
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    const btn = document.getElementById('confirmOk');
    const handler = function() { modal.close(); onConfirm(); btn.removeEventListener('click', handler); };
    btn.addEventListener('click', handler);
    modal.showModal();
};
