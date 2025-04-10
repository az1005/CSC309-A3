import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { addTransferAPI, addRedemptionAPI } from '../api/user';
import { useDashboard } from './DashboardContext';
import { getAllTransactionsAPI, getTransactionAPI, addTransactionAPI, markSuspiciousAPI } from '../api/transaction';

export const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
    const { token, user } = useAuth();
    const { convertPromotionsToArray } = useDashboard();
    const [loading, setLoading] = useState(false);
    const [transferMessage, setTransferMessage] = useState(null);
    const [redemptionMessage, setRedemptionMessage] = useState(null);
    const [adjustmentMessage, setAdjustmentMessage] = useState(null);
    const [allTransactionsCount, setAllTransactionsCount] = useState(0);
    const [allTransactionsError, setAllTransactionsError] = useState(null);
    const [singleTransaction, setSingleTransaction] = useState(null);

    const addTransfer = async (formData) => {
        if (!token) return;
        setLoading(true);
        setTransferMessage(null);
        const userId = parseInt(formData.userId);
        const amount = parseInt(formData.amount);
        const data = {
            type: formData.type,
            amount: amount,
        };
        if (formData.remark !== "") {
            data.remark = formData.remark;
        }
        try {
            const transfer = await addTransferAPI(userId, data, token);
            setTransferMessage("Success!");
        } catch(err) {
            setTransferMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addRedemption = async (formData) => {
        if (!token) return;
        setLoading(true);
        setRedemptionMessage(null);
        const amount = parseInt(formData.amount);
        const data = {
            type: formData.type,
            amount: amount
        };
        if (formData.remark !== "") {
            data.remark = formData.remark;
        }
        try {
            const redemption = await addRedemptionAPI(data, token);
            setRedemptionMessage("Success!");
        } catch(err) {
            setRedemptionMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAllTransactionsCount = async () => {
        if (!token) return;
        if (user && user.role !== "regular" && user.role !== "cashier") {
            setLoading(true);
            try {
                const response = await getAllTransactionsAPI('', token);
                setAllTransactionsCount(response.count);
            } catch(err) {
                throw err;
            } finally {
                setLoading(false);
            }
        }
    };

    const getAllTransactions = async (params) => {
        if (!token) return;
        if (user && user.role !== "regular" && user.role !== "cashier") {
            setLoading(true);
            setAllTransactionsError(null);
            try {
                return await getAllTransactionsAPI(params, token);
            } catch(err) {
                setAllTransactionsError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        }
    };

    const getTransaction = async (transactionId) => {
        if (!token) return;
        setLoading(true);
        const parsedId = parseInt(transactionId);
        try {
            const transaction = await getTransactionAPI(parsedId, token);
            setSingleTransaction(transaction);
        } catch (err) {
            setSingleTransaction(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addAdjustment = async (formData) => {
        if (!token) return;
        setLoading(true); 
        setAdjustmentMessage(null);
        const parsedAmount = parseInt(formData.amount);
        const parsedRelatedId = parseInt(formData.relatedId);
        const data = {
            utorid: formData.utorid,
            type: formData.type,
            amount: parsedAmount,
            relatedId: parsedRelatedId
        };
        if (formData.promotionIds !== "") {
            const promotionArray = convertPromotionsToArray(formData.promotionIds);
            if (promotionArray === null) {
                setAdjustmentMessage("Invalid Promotion ID");
                return;
            }
            data.promotionIds = promotionArray;
        }
        if (formData.remark !== "") {
            data.remark = formData.remark;
        }
        try {
            const adjustment = await addTransactionAPI(data, token);
            setAdjustmentMessage("Success!");
        } catch(err) {
            setAdjustmentMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markSuspicious = async (transactionId, suspicious) => {
        if (!token) return;
        setLoading(false);
        const parsedId = parseInt(transactionId);
        const payload = {suspicious: suspicious};
        try {
            const transaction = await markSuspiciousAPI(parsedId, payload, token);
        } catch(err) {
            throw err;
        } finally {
            setLoading(true);
        }
    };


    return (
        <TransactionContext.Provider value={{
            user, loading, transferMessage, redemptionMessage, allTransactionsCount, allTransactionsError, 
            singleTransaction, adjustmentMessage, setTransferMessage, setRedemptionMessage, addTransfer, 
            addRedemption, getAllTransactionsCount, getAllTransactions, getTransaction, setAdjustmentMessage, addAdjustment, markSuspicious,
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransaction = () => {
    return useContext(TransactionContext);
};
