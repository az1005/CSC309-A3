import React from 'react';
import NotFound from './NotFound';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import PromotionCard from '../components/PromotionCard';
import { usePromotion } from '../contexts/PromotionContext';

function PromotionPage() {
    const { promotionId } = useParams();
    const { singlePromotion, getPromotion } = usePromotion();

    useEffect(() => {
        getPromotion(promotionId);
    }, []);

    return <>
        {singlePromotion ? <>
            <PromotionCard 
            promotion={singlePromotion}/>
        </>
        : <NotFound />}
    </>
};

export default PromotionPage;