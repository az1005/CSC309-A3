import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import {  addTransactionAPI, processRedemptionAPI } from '../api/transaction';

export const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState(null);
    const [redemptionMessage, setRedemptionMessage] = useState(null);

    const convertPromotionsToArray = (input) => {
        const promotions = input.split(' ');
        const promotionsArray = [];
        for (let promotion of promotions) {
            if (promotion !== "") {
                const parsedPromotion = parseFloat(promotion);
                if (isNaN(parsedPromotion)) {
                    return null;
                }
                promotionsArray.push(parsedPromotion);
            }
        }
        return promotionsArray;
    };

    const addPurchase = async (formData) => {
        if (!token) return;
        setLoading(true);
        setPurchaseMessage(null);
        const parsedSpent = parseFloat(formData.spent);
        const data = {
            utorid: formData.username,
            type: formData.type,
            spent: parsedSpent,
        };
        if (formData.promotionIds !== "") {
            const promotionArray = convertPromotionsToArray(formData.promotionIds);
            if (promotionArray === null) {
                setPurchaseMessage("Invalid Promotion ID");
                return;
            }
            data.promotionIds = promotionArray;
        }
        if (formData.remark !== "") {
            data.remark = formData.remark;
        }
        try {
            const purchase = await addTransactionAPI(data, token);
            setPurchaseMessage("Success!");
        } catch(err) {
            setPurchaseMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const processRedemption = async (redemptionId) => {
        if (!token) return;
        setLoading(true);
        setRedemptionMessage(null);
        const parsedId = parseInt(redemptionId);
        try {
            const redemption = await processRedemptionAPI(parsedId, token);
            setRedemptionMessage("Success!");
        } catch(err) {
            setRedemptionMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardContext.Provider value={{
            user, loading, purchaseMessage, redemptionMessage, 
            setPurchaseMessage, setRedemptionMessage, addPurchase, processRedemption, convertPromotionsToArray
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    return useContext(DashboardContext);
};
