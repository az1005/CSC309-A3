const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const loginAPI = async (utorid, password) => {
    const res = await fetch(`${BACKEND_URL}/auth/tokens`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utorid, password }),
    });
    if (!res.ok) {
        // get the error message back from the backend
        const errorData = await res.json();
        const errorMsg = `Login failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const requestPasswordResetAPI = async (utorid) => {
    const res = await fetch(`${BACKEND_URL}/auth/resets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utorid }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Password reset request failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const resetPasswordAPI = async (utorid, newPassword, resetToken) => {
    const res = await fetch(`${BACKEND_URL}/auth/resets/${resetToken}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utorid, password: newPassword }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Reset password failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res;
};