/**
 * Modern Toast Notification Helper
 * Replaces Noty with Daisy UI toast components
 */

const Toast = {
    show: function(type, message, duration = 3000) {
        const toastContainer = this.getOrCreateContainer();

        const config = {
            'success': { color: '#3d8b5e', bg: '#f0faf4', icon: '✓' },
            'error':   { color: '#dc2626', bg: '#fef2f2', icon: '✕' },
            'warning': { color: '#d97706', bg: '#fffbeb', icon: '⚠' },
            'info':    { color: '#6366f1', bg: '#eef2ff', icon: 'ℹ' },
        }[type] || { color: '#6366f1', bg: '#eef2ff', icon: 'ℹ' };

        const toast = document.createElement('div');
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            background: ${config.bg};
            border: 1px solid var(--b3, #e5e7eb);
            border-left: 4px solid ${config.color};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 12px 16px;
            margin-bottom: 8px;
            min-width: 280px;
            max-width: 360px;
            transition: opacity 0.3s, transform 0.3s;
        `;

        toast.innerHTML = `
            <span style="color:${config.color};font-weight:700;font-size:1rem;flex-shrink:0">${config.icon}</span>
            <span style="font-size:0.875rem;font-weight:500;color:var(--bc, #1e293b);flex:1">${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success: function(message, duration) { this.show('success', message, duration); },
    error:   function(message, duration) { this.show('error',   message, duration); },
    warning: function(message, duration) { this.show('warning', message, duration); },
    info:    function(message, duration) { this.show('info',    message, duration); },

    getOrCreateContainer: function() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position:fixed;top:4rem;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;';
            document.body.appendChild(container);
        }
        return container;
    }
};

// Legacy noty compatibility layer
window.noty = function(options) {
    const type = options.type === 'alert' ? 'info' : options.type;
    Toast.show(type, options.text, options.timeout || 3000);
};

window.Toast = Toast;
