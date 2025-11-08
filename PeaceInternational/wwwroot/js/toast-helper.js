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

        const styles = {
            'success': 'bg-success text-success-content',
            'error': 'bg-error text-error-content',
            'warning': 'bg-warning text-warning-content',
            'info': 'bg-info text-info-content'
        }[type] || 'bg-info text-info-content';

        const icon = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type] || 'fa-info-circle';

        const toast = document.createElement('div');
        toast.className = `alert ${styles} shadow-xl mb-2 animate-slide-in`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas ${icon}"></i>
                <span class="font-medium">${message}</span>
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
