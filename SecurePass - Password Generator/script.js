document.addEventListener('DOMContentLoaded', function() {
    // Set copyright year
    document.getElementById('year').textContent = new Date().getFullYear();

    // DOM Elements
    const passwordField = document.getElementById('password');
    const copyBtn = document.getElementById('copy-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const excludeSimilarCheckbox = document.getElementById('exclude-similar');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    // Character sets
    const characterSets = {
        uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
        lowercase: 'abcdefghijkmnpqrstuvwxyz',
        numbers: '23456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Initialize
    updatePassword();
    
    // Event listeners
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        updatePassword();
    });

    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox, excludeSimilarCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', updatePassword);
    });

    copyBtn.addEventListener('click', copyPassword);
    regenerateBtn.addEventListener('click', function() {
        updatePassword();
        regenerateBtn.classList.add('copied');
        setTimeout(() => {
            regenerateBtn.classList.remove('copied');
        }, 400);
    });

    // Generate password function
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        let charset = '';
        
        if (uppercaseCheckbox.checked) {
            charset += excludeSimilarCheckbox.checked ? 
                characterSets.uppercase : 
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        
        if (lowercaseCheckbox.checked) {
            charset += excludeSimilarCheckbox.checked ? 
                characterSets.lowercase : 
                'abcdefghijklmnopqrstuvwxyz';
        }
        
        if (numbersCheckbox.checked) {
            charset += excludeSimilarCheckbox.checked ? 
                characterSets.numbers : 
                '0123456789';
        }
        
        if (symbolsCheckbox.checked) {
            charset += characterSets.symbols;
        }
        
        // If no character set is selected, default to lowercase letters
        if (charset === '') {
            charset = 'abcdefghijklmnopqrstuvwxyz';
            lowercaseCheckbox.checked = true;
        }
        
        // Generate password using cryptographically secure random numbers
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        
        return password;
    }

    // Update password display
    function updatePassword() {
        const password = generatePassword();
        passwordField.value = password;
        updatePasswordStrength(password);
    }

    // Copy password to clipboard
    function copyPassword() {
        passwordField.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
            </svg>
            Copied!
        `;
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }

    // Update password strength indicator
    function updatePasswordStrength(password) {
        const length = password.length;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);
        const hasExcludedSimilar = excludeSimilarCheckbox.checked;
        
        // Calculate strength score
        let score = 0;
        
        // Length contributes up to 50 points (max at 20+ chars)
        score += Math.min(length * 2.5, 50);
        
        // Character variety contributes up to 50 points
        const varietyCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
        score += varietyCount * 12.5;
        
        // Bonus for excluding similar characters
        if (hasExcludedSimilar) {
            score += 5;
        }
        
        // Normalize score to 0-100
        score = Math.min(Math.max(score, 0), 100);
        
        // Determine strength level
        let strength, strengthClass;
        
        if (length < 6) {
            strength = 'Very Weak';
            strengthClass = 'weak';
        } else if (length < 8) {
            strength = 'Weak';
            strengthClass = 'weak';
        } else if (length < 11) {
            strength = 'Moderate';
            strengthClass = 'moderate';
        } else if (length < 16 || score < 75) {
            strength = 'Strong';
            strengthClass = 'strong';
        } else if (length < 20 || score < 90) {
            strength = 'Very Strong';
            strengthClass = 'very-strong';
        } else {
            strength = 'Excellent';
            strengthClass = 'excellent';
        }
        
        // Additional explanations
        let explanation = '';
        if (length < 8) {
            explanation = 'Password is too short.';
        } else if (varietyCount < 3) {
            explanation = 'Try using more character types.';
        }
        
        // Update UI
        strengthFill.style.width = `${score}%`;
        strengthFill.style.backgroundColor = `var(--${strengthClass.replace(' ', '-')})`;
        
        strengthText.textContent = `Strength: ${strength}${explanation ? ' - ' + explanation : ''}`;
        strengthText.className = 'strength-text ' + strengthClass;
        
        // Update password field class
        passwordField.className = '';
        passwordField.classList.add(strengthClass);
    }
});