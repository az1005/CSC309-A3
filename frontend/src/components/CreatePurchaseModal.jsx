import { useState } from "react";
import {
    Box,
    TextField,
} from "@mui/material";
import { useDashboard } from "../contexts/DashboardContext";

const CreatePurchaseModal = () => {
    const { purchaseMessage, setPurchaseMessage, addPurchase } = useDashboard();

    const [purchaseData, setPurchaseData] = useState({
        username: "",
        type: "purchase",
        spent: "",
        promotionIds: "",
        remark: ""
    });

    const handleFormChange = (e) => {
        setPurchaseMessage(null);
        setPurchaseData({
            ...purchaseData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            addPurchase(purchaseData);
        } catch(err) {
            setPurchaseMessage(err);
        }
    };

    return (
        <Box className="box" sx = {{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        }}>
            <form id="transactionForm" onSubmit={handleFormSubmit}>
                <label htmlFor="utorid">UTORid:</label>
                <TextField
                    type="text"
                    id="username"
                    name="username"
                    label="UTORid"
                    variant="outlined"
                    value={purchaseData.username}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="spent">Spent:</label>
                <TextField 
                    type="number"
                    id="spent"
                    name="spent"
                    label="Spent"
                    variant="outlined"
                    value={purchaseData.spent}
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
                    value={purchaseData.promotionIds}
                    onChange={handleFormChange}
                />

                <label htmlFor="remark">Remark:</label>
                <TextField
                    type="text"
                    id="remark"
                    name="remark"
                    label="Remark"
                    variant="outlined"
                    value={purchaseData.remark}
                    onChange={handleFormChange}
                />
                <div className="btn-container">
                    <input type="submit"/>
                </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: "10px"}}>
                {purchaseMessage && <p style={{ textAlign: "center",
                    color: purchaseMessage === "Success!" ? "green" : "red"
                }}>{purchaseMessage}</p>}
            </div>
        </Box>
    );
}

export default CreatePurchaseModal;