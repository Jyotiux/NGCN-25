// Contact Form Email Handler
class ContactFormHandler {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.isSubmitting = false;
        
        // EmailJS configuration - Replace with your actual EmailJS credentials
        this.emailjsConfig = {
            serviceId: 'YOUR_SERVICE_ID',     // Replace with your EmailJS service ID
            templateId: 'YOUR_TEMPLATE_ID',   // Replace with your EmailJS template ID
            publicKey: 'YOUR_PUBLIC_KEY'      // Replace with your EmailJS public key
        };
        
        this.recipientEmail = 'YOUR_EMAIL_ID';
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Load EmailJS library
        this.loadEmailJS();
        
        // Get form elements
        this.getFormElements();
        
        // Add event listeners
        this.addEventListeners();
        
        // Add form validation
        this.setupValidation();
        
        console.log('Contact form handler initialized');
    }

    loadEmailJS() {
        // Load EmailJS SDK if not already loaded
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(this.emailjsConfig.publicKey);
                console.log('EmailJS loaded and initialized');
            };
            document.head.appendChild(script);
        } else {
            emailjs.init(this.emailjsConfig.publicKey);
        }
    }

    getFormElements() {
        // Get all form inputs
        const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        
        this.formElements = {
            name: Array.from(inputs).find(input => input.placeholder.toLowerCase().includes('name')),
            email: Array.from(inputs).find(input => input.placeholder.toLowerCase().includes('email')),
            subject: Array.from(inputs).find(input => input.placeholder.toLowerCase().includes('subject')),
            message: document.querySelector('textarea[placeholder*="message"]')
        };

        this.submitButton = document.querySelector('button span:contains("Send Message")') || 
                           document.querySelector('button[class*="bg-[#dde7f2]"]');

        if (!this.submitButton) {
            // If button not found by text, find by styling
            this.submitButton = document.querySelector('button');
        }
    }

    addEventListeners() {
        if (this.submitButton) {
            this.submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Add Enter key support for inputs
        Object.values(this.formElements).forEach(element => {
            if (element && element.tagName !== 'TEXTAREA') {
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleSubmit();
                    }
                });
            }
        });

        // Real-time validation
        Object.values(this.formElements).forEach(element => {
            if (element) {
                element.addEventListener('blur', () => this.validateField(element));
                element.addEventListener('input', () => this.clearFieldError(element));
            }
        });
    }

    setupValidation() {
        // Add required attribute to essential fields
        if (this.formElements.name) this.formElements.name.required = true;
        if (this.formElements.email) this.formElements.email.required = true;
        if (this.formElements.message) this.formElements.message.required = true;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Name validation
        if (field === this.formElements.name) {
            if (!value) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
        }

        // Email validation
        if (field === this.formElements.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        }

        // Message validation
        if (field === this.formElements.message) {
            if (!value) {
                errorMessage = 'Message is required';
                isValid = false;
            } else if (value.length < 10) {
                errorMessage = 'Message must be at least 10 characters';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Add error styling
        field.style.borderColor = '#ef4444';
        field.style.backgroundColor = '#fef2f2';

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-sm mt-1 px-4';
        errorDiv.textContent = message;

        // Insert error message after the field's parent label
        const label = field.closest('label');
        if (label) {
            label.insertAdjacentElement('afterend', errorDiv);
        }
    }

    clearFieldError(field) {
        // Reset field styling
        field.style.borderColor = '#d5dbe2';
        field.style.backgroundColor = '#f9fafb';

        // Remove error message
        const label = field.closest('label');
        if (label) {
            const errorDiv = label.parentElement.querySelector('.field-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate all fields
        Object.values(this.formElements).forEach(field => {
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getFormData() {
        return {
            name: this.formElements.name?.value?.trim() || '',
            email: this.formElements.email?.value?.trim() || '',
            subject: this.formElements.subject?.value?.trim() || 'Contact Form Submission',
            message: this.formElements.message?.value?.trim() || '',
            timestamp: new Date().toLocaleString(),
            recipient: this.recipientEmail
        };
    }

    async handleSubmit() {
        // Prevent double submission
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Please fix the errors before submitting.', 'error');
            return;
        }

        this.isSubmitting = true;
        this.setSubmitButtonState(true);

        try {
            const formData = this.getFormData();
            await this.sendEmail(formData);
            this.handleSuccess();
        } catch (error) {
            this.handleError(error);
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState(false);
        }
    }

    async sendEmail(formData) {
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS not loaded. Please check your internet connection.');
        }

        // Prepare template parameters
        const templateParams = {
            to_email: this.recipientEmail,
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            timestamp: formData.timestamp
        };

        // Send email via EmailJS
        const response = await emailjs.send(
            this.emailjsConfig.serviceId,
            this.emailjsConfig.templateId,
            templateParams
        );

        if (response.status !== 200) {
            throw new Error('Failed to send email');
        }

        return response;
    }

    handleSuccess() {
        this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        this.clearForm();
        
        // Optional: Track successful submission
        this.trackSubmission('success');
    }

    handleError(error) {
        console.error('Email sending failed:', error);
        
        let errorMessage = 'Failed to send message. ';
        
        if (error.message.includes('EmailJS')) {
            errorMessage += 'Please check your configuration and try again.';
        } else if (error.message.includes('network') || error.message.includes('internet')) {
            errorMessage += 'Please check your internet connection.';
        } else {
            errorMessage += 'Please try again later or contact us directly.';
        }

        this.showNotification(errorMessage, 'error');
        
        // Optional: Track failed submission
        this.trackSubmission('error', error.message);
    }

    setSubmitButtonState(isLoading) {
        if (!this.submitButton) return;

        const buttonText = this.submitButton.querySelector('span');
        if (buttonText) {
            if (isLoading) {
                buttonText.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                `;
                this.submitButton.disabled = true;
                this.submitButton.style.opacity = '0.7';
            } else {
                buttonText.textContent = 'Send Message';
                this.submitButton.disabled = false;
                this.submitButton.style.opacity = '1';
            }
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.contact-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `contact-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm`;
        
        // Set colors based on type
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    clearForm() {
        Object.values(this.formElements).forEach(field => {
            if (field) {
                field.value = '';
                this.clearFieldError(field);
            }
        });
    }

    trackSubmission(status, error = null) {
        // Optional: Add analytics tracking
        console.log(`Contact form submission: ${status}`, error ? { error } : {});
        
        // Example: Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_form_submit', {
                event_category: 'Contact',
                event_label: status,
                value: status === 'success' ? 1 : 0
            });
        }
    }

    // Public method to manually send test email
    async sendTestEmail() {
        const testData = {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Message',
            message: 'This is a test message from the contact form.',
            timestamp: new Date().toLocaleString()
        };

        try {
            await this.sendEmail(testData);
            console.log('Test email sent successfully');
            return true;
        } catch (error) {
            console.error('Test email failed:', error);
            return false;
        }
    }
}

// Add custom CSS for animations and styling
const style = document.createElement('style');
style.textContent = `
    .contact-notification {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .field-error {
        animation: fadeIn 0.2s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Loading spinner animation */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;

document.head.appendChild(style);

// Initialize contact form handler
const contactHandler = new ContactFormHandler();

// Make it globally accessible for debugging
window.contactHandler = contactHandler;

// Setup instructions for EmailJS
console.log(`
🚀 Contact Form Setup Instructions:

1. Sign up for EmailJS at https://www.emailjs.com/
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   - {{to_email}}
   - {{from_name}}
   - {{from_email}}
   - {{subject}}
   - {{message}}
   - {{timestamp}}

4. Replace the configuration values in the script:
   - YOUR_SERVICE_ID: Your EmailJS service ID
   - YOUR_TEMPLATE_ID: Your EmailJS template ID  
   - YOUR_PUBLIC_KEY: Your EmailJS public key

5. Template example:
   Subject: New Contact Form Message: {{subject}}
   
   From: {{from_name}} ({{from_email}})
   Date: {{timestamp}}
   
   Message:
   {{message}}

Once configured, the form will send emails directly to shivamani@gmail.com
`);