import { useState } from "react";
import {
    Box,
    TextField,
} from "@mui/material";
import { useTransaction } from "../contexts/TransactionContext";


const CreateTransferModal = () => {
const { transferMessage, setTransferMessage, addTransfer } = useTransaction();

    const [transferData, setTransferData] = useState({
        userId: "",
        type: "transfer",
        amount: "",
        remark: ""
    });


    const handleFormChange = (e) => {
        setTransferMessage(null);
        setTransferData({
            ...transferData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            addTransfer(transferData);
        } catch(err) {
            setTransferMessage(err);
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
                <label htmlFor="userId">User ID:</label>
                <TextField
                    type="number"
                    id="userId"
                    name="userId"
                    label="User ID"
                    variant="outlined"
                    value={transferData.userId}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="amount">Amount:</label>
                <TextField 
                    type="number"
                    id="amount"
                    name="amount"
                    label="Amount"
                    variant="outlined"
                    value={transferData.amount}
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
                    value={transferData.remark}
                    onChange={handleFormChange}
                />
                <div className="btn-container">
                    <input type="submit"/>
                </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: "10px"}}>
                {transferMessage && <p style={{ textAlign: "center",
                    color: transferMessage === "Success!" ? "green" : "red"
                }}>{transferMessage}</p>}
            </div>
        </Box>
    );
}

export default CreateTransferModal;