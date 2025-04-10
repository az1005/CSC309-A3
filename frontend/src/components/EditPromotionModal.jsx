import { useState } from "react";
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import { usePromotion } from "../contexts/PromotionContext";

const EditPromotionModal = ( { promotion }) => {
    const { updateMessage, setUpdateMessage, updatePromotion } = usePromotion();

    const [promotionData, setPromotionData] = useState({
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        startTime: promotion.startTime.toString().slice(0, 16),
        endTime: promotion.endTime.toString().slice(0, 16),
        minSpending: promotion.minSpending.toString(),
        rate: promotion.rate.toString(),
        points: promotion.points.toString()
    });

    const handleFormChange = (e) => {
        setUpdateMessage(null);
        setPromotionData({
            ...promotionData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            updatePromotion(promotion.id, promotionData);
        } catch(err) {
            setUpdateMessage(err);
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
            <form id="promotionForm" onSubmit={handleFormSubmit}>
                <label htmlFor="name">Name:</label>
                <TextField 
                    type="text"
                    id="name"
                    name="name"
                    label="Name"
                    variant="outlined"
                    value={promotionData.name}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="description">Description:</label>
                <TextField
                    type="text"
                    id="description"
                    name="description"
                    label="Description"
                    variant="outlined"
                    value={promotionData.description}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="type">Type:</label>
                <FormControl fullWidth required>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={promotionData.type}
                        onChange={handleFormChange}
                        label="Type"
                    >
                        <MenuItem value="automatic">automatic</MenuItem>
                        <MenuItem value="one-time">one-time</MenuItem>
                    </Select>
                </FormControl>
                <label htmlFor="startTime">Start Time:</label>
                <TextField
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={promotionData.startTime}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="endTime">End Time:</label>
                <TextField
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={promotionData.endTime}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="minSpending">Minimum Spending:</label>
                <TextField
                    type="number"
                    id="minSpending"
                    name="minSpending"
                    value={promotionData.minSpending}
                    onChange={handleFormChange}
                />
                <label htmlFor="rate">Rate:</label>
                <TextField
                    type="number"
                    id="rate"
                    name="rate"
                    value={promotionData.rate}
                    onChange={handleFormChange}
                />
                <label htmlFor="points">Points:</label>
                <TextField
                    type="number"
                    id="points"
                    name="points"
                    value={promotionData.points}
                    onChange={handleFormChange}
                />
                <div className="btn-container">
                    <input type="submit"/>
                </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: "10px"}}>
                {updateMessage && <p style={{ textAlign: "center",
                    color: updateMessage === "Success!" ? "green" : "red"
                }}>{updateMessage}</p>}
            </div>
        </Box>
    );
}

export default EditPromotionModal;