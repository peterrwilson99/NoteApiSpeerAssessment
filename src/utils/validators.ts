export function validateEmail(email: string): boolean {
    // email regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return false;
    }
    return true;
}

export function validatePassword(password: string): boolean {
    if (password.length < 8) {
        return false;
    }
    // pass must contain:
    // 1 lowercase letter
    // 1 uppercase letter
    // 1 number
    // 1 special character
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!regex.test(password)) {
        return false;
    }
    return true;
}