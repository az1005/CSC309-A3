import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    FormLabel,
    Box
} from '@mui/material';
import { useEvent } from '../contexts/EventContext';

const RewardDialog = ({ open, onClose }) => {
    const { singleEvent, createEventTransaction } = useEvent();

    // rewardType is single for awarding to one user or all
    const [rewardType, setRewardType] = useState('single');
    const [utorid, setUtorid] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [updateMessage, setUpdateMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUpdateMessage('');

        // validate amount: must be a positive integer
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setError('Amount must be a positive number.');
            return;
        }
        // if awarding to a single user, UTORid must be provided
        if (rewardType === 'single' && !utorid.trim()) {
            setError('UTORid is required for awarding points to a single user.');
            return;
        }

        const params = {
            type: 'event',
            amount: Number(amount)
        };

        // only include utorid if a single reward is selected
        if (rewardType === 'single') {
            params.utorid = utorid.trim();
        }

        try {
            await createEventTransaction(singleEvent.id, params);
            setUpdateMessage('Reward transaction successful!');
            setAmount('');
            setUtorid('');
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create Reward Transaction</DialogTitle>
            <DialogContent dividers>
                <Box component="form" onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 2,
                        mt: 1
                    }}>
                    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                        <FormLabel component="legend">Reward for</FormLabel>
                        <RadioGroup
                            row
                            value={rewardType}
                            onChange={(e) => setRewardType(e.target.value)}
                        >
                            <FormControlLabel
                                value="single"
                                control={<Radio />}
                                label="Single user"
                            />
                            <FormControlLabel value="all" control={<Radio />} label="All users" />
                        </RadioGroup>
                    </FormControl>

                    {rewardType === 'single' && (
                        <TextField
                            fullWidth
                            label="UTORid"
                            name="utorid"
                            value={utorid}
                            onChange={(e) => setUtorid(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    {error && (
                        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            {error}
                        </Typography>
                    )}
                    {updateMessage && (
                        <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                            {updateMessage}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" sx={{bgcolor:"#4a4e69"}}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RewardDialog;
