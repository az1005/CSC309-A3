import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { useEvent } from "../contexts/EventContext";
import { useTransaction } from "../contexts/TransactionContext";

const CreateAdjustmentModal = ( {transaction} ) => {
    const { adjustmentMessage, setAdjustmentMessage, addAdjustment } = useTransaction();
    
    const [adjustmentData, setAdjustmentData] = useState({
        utorid: transaction.utorid,
        type: "adjustment",
        amount: transaction.amount,
        relatedId: transaction.id,
        promotionIds: transaction.promotionIds.join(' '),
        remark: transaction.remark
    });

    const handleFormChange = (e) => {
        setAdjustmentMessage(null);
        setAdjustmentData({
            ...adjustmentData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            addAdjustment(adjustmentData);
        } catch(err) {
            setAdjustmentMessage(err);
        }
    };

    return (
        <Box className="box" sx = {{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        }}> 
            <div style={{justifyItems: "center"}}>
            <Typography variant="h6">Create Adjustment</Typography>
            </div>
            <br></br>
            <form id="transactionForm" onSubmit={handleFormSubmit}>
                <label htmlFor="amount">Amount:</label>
                <TextField 
                    type="number"
                    id="amount"
                    name="amount"
                    label="Amount"
                    variant="outlined"
                    value={adjustmentData.amount}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="promotionIds">Enter promotion IDs 
                    <br></br>(space-separated):</label>
                <TextField
                    type="text"
                    id="promotionIds"
                    name="promotionIds"
                    label="Promotion IDs"
                    variant="outlined"
                    value={adjustmentData.promotionIds}
                    onChange={handleFormChange}
                />

                <label htmlFor="remark">Remark:</label>
                <TextField
                    type="text"
                    id="remark"
                    name="remark"
                    label="Remark"
                    variant="outlined"
                    value={adjustmentData.remark}
                    onChange={handleFormChange}
                />
                <div className="btn-container">
                    <input type="submit"/>
                </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: "10px"}}>
                {adjustmentMessage && <p style={{ textAlign: "center",
                    color: adjustmentMessage === "Success!" ? "green" : "red"
                }}>
                    {adjustmentMessage}
                </p>}
            </div>
        </Box>
    );
};

export default CreateAdjustmentModal;