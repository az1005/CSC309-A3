import React from "react";
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Modal, 
    Box, 
    FormControlLabel, 
    Checkbox
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransaction } from "../contexts/TransactionContext";
import CreateAdjustmentModal from "./CreateAdjustmentModal";
import DisplayQrCodeDialog from "./DisplayQRCodeDialog";

function TransactionCard( {transaction}) {
    const { currentInterface, singleUser, getUser } = useUser();
    const { getTransaction, setAdjustmentMessage, markSuspicious } = useTransaction();

    const navigate = useNavigate();

    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const handleOpenQrDialog = () => setQrDialogOpen(true);
    const handleCloseQrDialog = () => setQrDialogOpen(false);
    
    const [openEdit, setOpenEdit] = useState(false);
    const handleOpenEdit = () => setOpenEdit(true);
    const handleCloseEdit = () => { 
        setAdjustmentMessage(null); 
        setOpenEdit(false); 
    }

    const [openSuspicious, setOpenSuspicious] = useState(false);
    const handleOpenSuspicious = () => setOpenSuspicious(true);
    const handleCloseSuspicious= () => { 
        setOpenSuspicious(false);
        getTransaction(transaction.id);
    };

    const [suspicious, setSuspicious] = useState(transaction.suspicious);

    const handleSubmit = () => {
        try {
            markSuspicious(transaction.id, suspicious);
        } catch(err) {
            throw err;
        }
    };

    useEffect(() => {
        if (transaction.type === "transfer") {
            getUser(transaction.relatedId);
        }
        if (transaction.type === "redemption" && transaction.relatedId) {
            getUser(transaction.relatedId);
        }
    }, []);


    return <>
        <Card variant="outlined" sx={{position: "relative", width: "300px", height: "350px"}}>
            <CardContent sx={{display: "flex", flexDirection: "column", gap: "10px"}}>
                <Typography gutterBottom variant="h6" component="div">
                    Transaction {transaction.id}
                </Typography>
                <Typography variant="body2">
                    UTORid: {transaction.utorid}
                </Typography>
                <Typography variant="body2">
                    Type: {transaction.type}
                </Typography>
                <Typography variant="body2">
                    Amount: {transaction.amount}
                </Typography>
            {transaction.remark ? 
                <Typography variant="body2">Remark: {transaction.remark}</Typography> 
                            : <></> }
            {transaction.type === "purchase" ? <>
                <Typography variant="body2">Spent: {transaction.spent} </Typography>
                <Typography variant="body2">
                    Promotion IDs: {transaction.promotionIds.length > 0 ? transaction.promotionIds.join(', ') : 'None'}
                </Typography>
            </> : 
            transaction.type === "redemption" ? <>
            {transaction.redeemed ? <>
                <Typography variant="body2">Redeemed: Yes </Typography>
                <Typography variant="body2">Processed By: {singleUser?.utorid}</Typography>
            </> : <Typography variant="body2">Redeemed: No </Typography>}
            </> : 
            transaction.type === "transfer" ? <>
                <Typography variant="body2">Sender/Recipient: {singleUser?.utorid}</Typography>
            </> : 
            transaction.type === "adjustment" ? <>
                <Typography variant="body2">Original Transaction ID: {transaction.relatedId}</Typography>
            </> :
            <>
                <Typography variant="body2">Event ID: {transaction.relatedId}</Typography>
            </>
            }
                
            </CardContent>
            <CardActions sx={{position: "absolute", bottom: "0"}}>
            {transaction.type === "redemption" && !transaction.redeemed ? 
            <>
                <Button size="small" variant="outlined" onClick={handleOpenQrDialog}>
                    QR
                </Button> 
                <DisplayQrCodeDialog
                open={qrDialogOpen}
                onClose={handleCloseQrDialog}
                qrValue={JSON.stringify(transaction)}
                />
            </>
            : 
            <></>}
            {currentInterface === "regular" || currentInterface === "cashier" ? <>
            </> : <>
                    <Button size="small" variant="outlined" onClick={handleOpenEdit}>Adjust</Button>
                    <Modal open={openEdit} onClose={handleCloseEdit}>
                        <CreateAdjustmentModal transaction={transaction} />
                    </Modal>
                    <Button size="small" variant="outlined" onClick={handleOpenSuspicious}>Suspicious?</Button>
                    <Modal open={openSuspicious} onClose={handleCloseSuspicious}>
                    <Box sx = {{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    }}>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={suspicious}
                                        name="suspicious"
                                        onChange={() => setSuspicious(!suspicious)}
                                    />
                                }
                                label="Suspicious"
                            />
                            <div className="btn-container">
                                <button onClick={handleSubmit}>Save</button>
                            </div>
                            </div>

                    </Box>
                    </Modal>
            </>
            }
            </CardActions>
        </Card>
        <Button variant="outlined" onClick={() => navigate("/transaction")}>Back</Button>
    </>;
};

export default TransactionCard;