const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const addTransactionAPI = async (payload, token) => {
    const res = await fetch(`${BACKEND_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Create Transaction Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const processRedemptionAPI = async (redemptionId, token) => {
    const body = {processed: true};
    const res = await fetch(`${BACKEND_URL}/transactions/${redemptionId}/processed`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Process Redemption Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const getAllTransactionsAPI = async (params, token) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BACKEND_URL}/transactions?${query}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Get Transactions Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const getTransactionAPI = async (transactionId, token) => {
    const res = await fetch(`${BACKEND_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Get Transaction Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const markSuspiciousAPI = async (transactionId, payload, token) => {
    const res = await fetch(`${BACKEND_URL}/transactions/${transactionId}/suspicious`, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Mark Suspicious Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};