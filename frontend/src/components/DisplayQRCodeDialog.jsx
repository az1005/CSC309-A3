import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import CloseIcon from '@mui/icons-material/Close';

const DisplayQrCodeDialog = ({ open, onClose, qrValue }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                QR Code
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                {/* Render the QRCode component with your value */}
                <QRCodeSVG value={qrValue} size={256} />
            </DialogContent>
        </Dialog>
    );
};

export default DisplayQrCodeDialog;