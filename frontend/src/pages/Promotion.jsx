import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { Button, Modal, Typography } from "@mui/material";
import { usePromotion } from "../contexts/PromotionContext";
import CreatePromotionModal from "../components/CreatePromotionModal";
import { useState } from "react";
import PaginatedTable from "../components/PaginatedTable";
import { useNavigate } from "react-router-dom";

function Promotion () {
    const { currentInterface } = useUser();
    const { setCreateMessage, getPromotions, error } = usePromotion();
    const [initialParams, setInitialParams] = useState({ page: 1, limit: 10 });

    const [openCreate, setOpenCreate] = useState(false);
    const handleOpenCreate = () => setOpenCreate(true);
    const handleCloseCreate = () => { 
        setCreateMessage(null); 
        setOpenCreate(false); 
        setInitialParams(prev => ({...prev, page: 1}));
    };

    const columns = [
        { field: 'name', headerName: 'Name'},
        { field: 'type', headerName: 'Type'},
        { field: 'startTime', headerName: 'Start Time'},
        { field: 'endTime', headerName: 'End Time'},
    ];

    const regFiltersConfig = [
        { field: 'name', label: 'Search by name', type: 'text'},
        { field: 'type', label: 'Type', type: 'select', options: ['automatic', 'one-time'] },
    ];

    const manFiltersConfig = [
        { field: 'name', label: 'Search by name', type: 'text'},
        { field: 'type', label: 'Type', type: 'select', options: ['automatic', 'one-time'] },
        { field: 'started', label: 'Started', type: 'boolean'}, 
        { field: 'ended', label: 'Ended', type: 'boolean'}, 
    ];


    return <>
        {currentInterface === "regular" || currentInterface === "cashier" ? <>
            <PaginatedTable 
                fetchData={getPromotions}
                columns={columns}
                filtersConfig={regFiltersConfig}
                initialParams={{ page: 1, limit: 10 }}
            />
        </>
        : <>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <PaginatedTable 
                fetchData={getPromotions}
                columns={columns}
                filtersConfig={manFiltersConfig}
                initialParams={initialParams}
            />
            
            {error && <Typography variant="body2" sx={{color: "red"}}>{error}</Typography>}
            </div>
            <Button variant="outlined" onClick={handleOpenCreate}>Create Promotion</Button>
            <Modal open={openCreate} onClose={handleCloseCreate}>
                <CreatePromotionModal />
            </Modal>
        </>
        }
    </>;
};

export default Promotion;