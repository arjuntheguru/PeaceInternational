/**
 * Modern Toast Notification Helper
 * Replaces Noty with Daisy UI toast components
 */

const Toast = {
    /**
     * Show a toast notification
     * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    show: function(type, message, duration = 3000) {
        const toastContainer = this.getOrCreateContainer();

        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-error',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const icon = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type] || 'fa-info-circle';

        const toast = document.createElement('div');
        toast.className = `alert ${alertClass} shadow-lg mb-2 animate-slide-in`;
        toast.innerHTML = `
            <div>
                <i class="fas ${icon} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success: function(message, duration) {
        this.show('success', message, duration);
    },

    error: function(message, duration) {
        this.show('error', message, duration);
    },

    warning: function(message, duration) {
        this.show('warning', message, duration);
    },

    info: function(message, duration) {
        this.show('info', message, duration);
    },

    getOrCreateContainer: function() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast toast-top toast-center z-[100]';
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

// Export for use in other scripts
window.Toast = Toast;
