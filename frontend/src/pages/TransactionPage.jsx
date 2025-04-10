import React from 'react';
import NotFound from './NotFound';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import TransactionCard from '../components/TransactionCard';
import { useTransaction } from '../contexts/TransactionContext';

function TransactionPage() {
    const { transactionId } = useParams();
    const { singleTransaction, getTransaction } = useTransaction();

    useEffect(() => {
        getTransaction(transactionId);
    }, []);

    return <>
        {singleTransaction ? <>
            <TransactionCard 
            transaction={singleTransaction}/>
        </>
        : <NotFound />}
    </>
};

export default TransactionPage;