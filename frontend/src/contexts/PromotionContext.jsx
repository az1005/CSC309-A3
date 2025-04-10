import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { createPromotionAPI, updatePromotionAPI, deletePromotionAPI, getPromotionsAPI, getPromotionAPI } from '../api/promotion';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

export const PromotionContext = createContext(null);

export const PromotionProvider = ({ children }) => {
    const { token, user } = useAuth();
    const { currentInterface } = useUser();
    const [loading, setLoading] = useState(false);
    const [createMessage, setCreateMessage] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [allPromotionsCount, setAllPromotionsCount] = useState(0);
    const [error, setError] = useState(null);
    const [singlePromotion, setSinglePromotion] = useState(null);
    const navigate = useNavigate();

    const addPromotion = async (formData) => {
        if (!token) return;
        setLoading(true);
        setCreateMessage(null);
        const data = {
            name: formData.name,
            description: formData.description,
            type: formData.type,
            startTime: formData.startTime,
            endTime: formData.endTime
        };
        if (formData.minSpending !== "") {
            data.minSpending = parseFloat(formData.minSpending);
        }
        if (formData.rate !== "") {
            data.rate = parseFloat(formData.rate);
        }
        if (formData.points !== "") {
            data.points = parseInt(formData.points);
        }
        try {
            const promotion = await createPromotionAPI(data, token);
            setCreateMessage("Success!");
        } catch(err) {
            setCreateMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePromotion = async (promotionId) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const promotion = await deletePromotionAPI(promotionId, token);
            navigate("/promotion");
        } catch(err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePromotion = async (promotionId, formData) => {
        if (!token) return;
        setLoading(true);
        setUpdateMessage(null);
        const data = {
            name: formData.name,
            description: formData.description,
            type: formData.type,
            startTime: formData.startTime,
            endTime: formData.endTime
        };
        if (formData.minSpending !== "") {
            data.minSpending = parseFloat(formData.minSpending);
        }
        if (formData.rate !== "") {
            data.rate = parseFloat(formData.rate);
        }
        if (formData.points !== "") {
            data.points = parseInt(formData.points);
        }
        try {
            const promotion = await updatePromotionAPI(promotionId, data, token);
            setUpdateMessage("Success!");
        } catch(err) {
            setUpdateMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getPromotions = async(params) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            return await getPromotionsAPI(params, token);
        } catch(err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAllPromotionsCount = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await getPromotionsAPI('', token);
            setAllPromotionsCount(response.count);
        } catch(err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getPromotion = async (promotionId) => {
        if (!token) return;
        setLoading(true);
        const parsedId = parseInt(promotionId);
        try {
            const promotion = await getPromotionAPI(parsedId, token);
            setSinglePromotion(promotion);
        } catch(err) {
            setSinglePromotion(null);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }

    };

    return (
        <PromotionContext.Provider value={{
            user, loading, createMessage, updateMessage, allPromotionsCount, getPromotions, error, setError, getPromotion, singlePromotion,
            setUpdateMessage, setCreateMessage, addPromotion, deletePromotion, updatePromotion, getAllPromotionsCount
        }}>
            {children}
        </PromotionContext.Provider>
    );
};

export const usePromotion = () => {
    return useContext(PromotionContext);
};
