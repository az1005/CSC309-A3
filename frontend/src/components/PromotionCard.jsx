import React from "react";
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Modal, 
    Box
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import { usePromotion } from "../contexts/PromotionContext";
import EditPromotionModal from "./EditPromotionModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PromotionCard( {promotion}) {
    const { currentInterface } = useUser();
    const { setUpdateMessage, error, setError, getPromotion, deletePromotion } = usePromotion();
    const navigate = useNavigate();
    
    const [openEdit, setOpenEdit] = useState(false);
    const handleOpenEdit = () => setOpenEdit(true);
    const handleCloseEdit = () => { 
        setUpdateMessage(null); 
        setOpenEdit(false); 
        getPromotion(promotion.id);
    }

    const [openDelete, setOpenDelete] = useState(false);
    const handleOpenDelete = () => setOpenDelete(true);
    const handleCloseDelete = () => { 
        setError(null); 
        setOpenDelete(false);
    }

    const handleDelete = () => {
        try {
            deletePromotion(promotion.id);
        } catch(err) {
            setError(err);
        }
    };

    return <>
        <Card variant="outlined" sx={{position: "relative", width: "300px", height: "350px"}}>
            <CardContent sx={{display: "flex", flexDirection: "column", gap: "10px"}}>
                <Typography gutterBottom variant="h6" component="div">
                    Promotion {promotion.id}: {promotion.name}
                </Typography>
                <Typography variant="body2">
                    Description: {promotion.description}
                </Typography>
                <Typography variant="body2">
                    Type: {promotion.type}
                </Typography>
                {promotion.startTime && <Typography variant="body2">
                    From: {promotion.startTime}
                </Typography>}
                <Typography variant="body2">
                    Until: {promotion.endTime}
                </Typography>
                <Typography variant="body2">
                    You must spend at least ${promotion.minSpending} to trigger the promotion. 
                    You'll receive points at a rate of {promotion.rate}, plus an additional {promotion.points} {promotion.points === 1 ? 'point.' : 'points.'}
                </Typography>
            </CardContent>
            {currentInterface === "regular" || currentInterface === "cashier" ? <></> :
                <CardActions sx={{position: "absolute", bottom: "0"}}>
                    <Button size="small" variant="outlined" onClick={handleOpenEdit}>Edit</Button>
                    <Modal open={openEdit} onClose={handleCloseEdit}>
                        <EditPromotionModal promotion={promotion}/>
                    </Modal>
                    <Button size="small" variant="outlined" onClick={handleOpenDelete}>Delete</Button>
                        <Modal open={openDelete} onClose={handleCloseDelete}>
                        <Box className="delete-promotion" sx = {{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 450,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        }}>
                            <Typography variant="h6">Delete Promotion?</Typography>
                            <Typography variant="body1">This action cannot be undone.</Typography>
                            <Box className="delete-promotion-btn-box" sx = {{display: "flex", justifyContent: "right", gap: "10px"}}>
                                <Button variant="outlined" onClick={handleCloseDelete}>Cancel</Button>
                                <Button variant="outlined" color="error" onClick={handleDelete}>Delete</Button>
                            </Box>
                            {error && <Typography variant="body2" sx={{color: "red"}}>{error}</Typography>}
                        </Box>
                        </Modal>
                </CardActions>
            }
        </Card>
        <Button variant="outlined" onClick={() => navigate("/promotion")}>Back</Button>
    </>;
};

export default PromotionCard;