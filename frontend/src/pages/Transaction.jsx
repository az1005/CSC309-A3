import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Modal, Button, Typography} from "@mui/material";
import { useState } from "react";
import CreateRedemptionModal from "../components/CreateRedemptionModal";
import CreateTransferModal from "../components/CreateTransferModal";
import { useTransaction } from "../contexts/TransactionContext";
import TransactionTable from "../components/TransactionTable";

function Transaction() {
    const { user } = useAuth();
    const { currentInterface, getOwnTransactions, error } = useUser();
    const { setTransferMessage, setRedemptionMessage, getAllTransactions, allTransactionsError } = useTransaction();

    const [initialParams, setInitialParams] = useState({ page: 1, limit: 10 });

    const [openTransfer, setOpenTransfer] = useState(false);
    const handleOpenTransfer = () => setOpenTransfer(true);
    const handleCloseTransfer = () => { 
        setTransferMessage(null); 
        setOpenTransfer(false); 
        setInitialParams(prev => ({...prev, page: 1}));
    }

    const [openRedemption, setOpenRedemption] = useState(false);
    const handleOpenRedemption = () => setOpenRedemption(true);
    const handleCloseRedemption = () => { 
        setRedemptionMessage(null); 
        setOpenRedemption(false); 
        setInitialParams(prev => ({...prev, page: 1}));
    }

    const regColumns = [
        { field: 'type', headerName: 'Type' },
        { field: 'amount', headerName: 'Amount' },
        { field: 'createdBy', headerName: 'Created By'},
        { field: 'relatedId', headerName: 'Related ID', renderCell: (value) => value.relatedId ? value.relatedId : 'None'}
    ];

    const manColumns = [
        { field: 'utorid', headerName: 'UTORid'}, 
        { field: 'type', headerName: 'Type' },
        { field: 'amount', headerName: 'Amount' },
        { field: 'createdBy', headerName: 'Created By'},
        { field: 'relatedId', headerName: 'Related ID', renderCell: (value) => value.relatedId ? value.relatedId : 'None'}
    ];

    const regFiltersConfig = [
        { field: 'type', label: 'Type', type: 'select', options: ['purchase', 'adjustment', 'transfer', 'redemption', 'event']},
        { field: 'relatedId', label: 'Related ID', type: 'text'},
        // { field: 'promotionId', label: 'Promotion ID', type: 'text'}, // doesn't work not sure if it's a backend thing
        { field: 'amount', label: 'Amount', type: 'text'}, 
        { field: 'operator', label: '> or <', type: 'select', options: ['gte', 'lte']},
    ];

    const manFiltersConfig = [
        { field: 'name', label: 'Name/UTORid', type: 'text' },
        { field: 'createdBy', label: 'Creator', type: 'text' },
        { field: 'suspicious', label: 'Suspicious', type: 'boolean'},
        // { field: 'promotionId', label: 'Promotion ID', type: 'text'},
        { field: 'type', label: 'Type', type: 'select', options: ['purchase', 'adjustment', 'transfer', 'redemption', 'event']},
        { field: 'relatedId', label: 'Related ID', type: 'text'},
        { field: 'amount', label: 'Amount', type: 'text'}, 
        { field: 'operator', label: '> or <', type: 'select', options: ['gte', 'lte']},
    ];
    

    return <>
        {currentInterface === "regular" || currentInterface === "cashier" ? <>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <TransactionTable 
                fetchData={getOwnTransactions}
                columns={regColumns}
                filtersConfig={regFiltersConfig}
                initialParams={initialParams}
            />
            {error && <Typography variant="body2" sx={{color: "red"}}>{error}</Typography>}
        </div>
            <div className="btn-group-transaction">
            <Button variant="outlined" onClick={handleOpenTransfer}>Make a Transfer</Button>
            <Modal open={openTransfer} onClose={handleCloseTransfer}>
                <CreateTransferModal />
            </Modal>
            <Button variant="outlined" onClick={handleOpenRedemption}>Make a Redemption</Button>
            <Modal open={openRedemption} onClose={handleCloseRedemption}>
                <CreateRedemptionModal />
            </Modal>
            </div>
        </>
        : <>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <TransactionTable 
                fetchData={getAllTransactions}
                columns={manColumns}
                filtersConfig={manFiltersConfig}
                initialParams={initialParams}
            />
            {allTransactionsError && <Typography variant="body2" sx={{color: "red"}}>{allTransactionsError}</Typography>}
        </div>
        </>
        }
    </>;
}

export default Transaction;