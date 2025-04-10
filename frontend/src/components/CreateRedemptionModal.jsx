import { useState } from "react";
import {
    Box,
    TextField,
} from "@mui/material";
import { useTransaction } from "../contexts/TransactionContext";

const CreateRedemptionModal = () => {
    const { redemptionMessage, setRedemptionMessage, addRedemption } = useTransaction();

    const [redemptionData, setRedemptionData] = useState({
        type: "redemption",
        amount: "",
        remark: ""
    });

    const handleFormChange = (e) => {
        setRedemptionMessage(null);
        setRedemptionData({
            ...redemptionData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            addRedemption(redemptionData);
        } catch(err) {
            setRedemptionMessage(err);
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
            <form id="transactionForm" onSubmit={handleFormSubmit}>
                <label htmlFor="amount">Amount:</label>
                <TextField 
                    type="number"
                    id="amount"
                    name="amount"
                    label="Amount"
                    variant="outlined"
                    value={redemptionData.amount}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="remark">Remark:</label>
                <TextField
                    type="text"
                    id="remark"
                    name="remark"
                    label="Remark"
                    variant="outlined"
                    value={redemptionData.remark}
                    onChange={handleFormChange}
                />
                <div className="btn-container">
                    <input type="submit"/>
                </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: "10px"}}>
                {redemptionMessage && <p style={{ textAlign: "center",
                    color: redemptionMessage === "Success!" ? "green" : "red"
                }}>{redemptionMessage}</p>}
            </div>
        </Box>
    );
}

export default CreateRedemptionModal;