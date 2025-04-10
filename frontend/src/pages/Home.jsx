import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./main.css";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { Button, Modal, Card, CardContent, CardActions, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CreatePurchaseModal from "../components/CreatePurchaseModal";
import ProcessRedemptionModal from "../components/ProcessRedemptionModal";
import { useDashboard } from "../contexts/DashboardContext";
import { usePromotion } from "../contexts/PromotionContext";
import { useEvent } from "../contexts/EventContext";
import { useTransaction } from "../contexts/TransactionContext";

function Home() {
    const { user } = useAuth();
    const { currentInterface, allUsersCount, getAllUsersCount } = useUser();
    const { setPurchaseMessage, setRedemptionMessage } = useDashboard();

    const { allPromotionsCount, getAllPromotionsCount } = usePromotion();
    const { allEventsCount, getAllEventsCount } = useEvent();
    const { allTransactionsCount, getAllTransactionsCount} = useTransaction();

    useEffect(() => {
        // Get promotions count on mount
        getAllPromotionsCount();
        getAllEventsCount();
        getAllUsersCount();
        getAllTransactionsCount();
    }, []);

    // Get recent transactions (max 3)
    const recentTransactions = user?.transactions?.slice(0, 3);

    const [openForm, setOpenForm] = useState(false);
    const handleOpenForm = () => setOpenForm(true);
    const handleCloseForm = () => { setPurchaseMessage(null); setOpenForm(false); }

    const [openRedemption, setOpenRedemption] = useState(false);
    const handleOpenRedemption = () => setOpenRedemption(true);
    const handleCloseRedemption = () => { setRedemptionMessage(null); setOpenRedemption(false); }

    const navigate = useNavigate();

    return <>
        {/* Interface changes depending on user role*/}
        {user ?
            currentInterface === "regular" ? <>
                {/* Regular*/}
                <div style={{display: "block", textAlign: "center"}}>
                    <h2>Dashboard</h2>
                    <Card variant="outlined" sx={{my: "8px", p: "8px"}}>
                        <CardContent sx={{padding: "0 !important"}}>
                            <strong>Points: </strong>{user.points}
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{my: "8px"}}>
                        <CardContent>
                            <strong>Recent Transactions</strong>
                            {recentTransactions && recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="transaction">
                            <Accordion sx={{mt: "4px"}}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <p style={{fontSize: "16px"}}><strong>Transaction {transaction.id}</strong></p>
                                </AccordionSummary>
                                <AccordionDetails>
                                <p style={{fontSize: "14px"}}><strong>Type:</strong> {transaction.type}</p>
                                <p style={{fontSize: "14px"}}><strong>Amount:</strong> {transaction.amount}</p>
                                </AccordionDetails>
                            </Accordion>
                            </div>
                        ))
                        ) : (
                            <p>No transactions available.</p>
                        )}
                        </CardContent>
                    </Card>
                </div>
                <div className="btn-group">
                    <Button variant="outlined" onClick={() => navigate("/transaction")}>Transactions Page</Button>
                    <Button variant="outlined" onClick={() => navigate("/event")}>Events Page</Button>
                    <Button variant="outlined" onClick={() => navigate("/promotion")}>Promotions Page</Button>
                </div>
            </>
            : currentInterface === "cashier" ? <>
                {/* Cashier*/}
                <h2>Dashboard</h2>
                <div className="btn-group">
                    <Button variant="outlined" onClick={handleOpenForm}>Create Purchase</Button>
                    <Modal open={openForm} onClose={handleCloseForm}>
                        <CreatePurchaseModal />
                    </Modal>
                    <Button variant="outlined" onClick={handleOpenRedemption}>Process Redemption</Button>
                    <Modal open={openRedemption} onClose={handleCloseRedemption}>
                        <ProcessRedemptionModal />
                    </Modal>
                    <Button variant="outlined" onClick={() => navigate('/register')}>Register a User</Button>
                </div>
                <div className="btn-group">
                    <Button variant="outlined" onClick={() => navigate("/transaction")}>Transactions Page</Button>
                    <Button variant="outlined" onClick={() => navigate("/event")}>Events Page</Button>
                    <Button variant="outlined" onClick={() => navigate("/promotion")}>Promotions Page</Button>
                </div>
            </>
            : currentInterface === "event organizer" ? <>
                {/* Event organizer */}
                <h2>Dashboard</h2>
                <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <div style={{display: "flex", gap: "8px"}}>
                    <Card variant="outlined" className="dashboard-card">
                        <CardContent>
                            <Typography className="dashboard-title" gutterBottom variant="h6" component="div">
                                Events
                            </Typography>
                            <Typography variant="body2">
                                There is a total of {allEventsCount} {allEventsCount === 1 ? 'event.' : 'events.' }
                            </Typography>
                        </CardContent>
                        <CardActions sx={{position: "absolute", bottom: "0"}}>
                            <Button className="dashboard-btn" size="small" variant="outlined" onClick={() => navigate("/event")}>Manage Events</Button>
                        </CardActions>
                    </Card>
                    </div>
                </div>
            </>
            : <>
                {/* Manager/Superuser*/}
                <h2>Dashboard</h2>
                <div className="card-group">
                    <div className="card-pair">
                    <Card variant="outlined" className="dashboard-card">
                        <CardContent>
                            <Typography className="dashboard-title" gutterBottom variant="h6" component="div">
                                Events
                            </Typography>
                            <Typography variant="body2">
                                There is a total of {allEventsCount} {allEventsCount === 1 ? 'event.' : 'events.' }
                            </Typography>
                        </CardContent>
                        <CardActions sx={{position: "absolute", bottom: "0"}}>
                            <Button className="dashboard-btn" size="small" variant="outlined" onClick={() => navigate("/event")}>Manage Events</Button>
                        </CardActions>
                    </Card>
                    <Card variant="outlined" className="dashboard-card">
                        <CardContent>
                            <Typography className="dashboard-title" gutterBottom variant="h6" component="div">
                                Promotions
                            </Typography>
                            <Typography variant="body2">
                                There is a total of {allPromotionsCount} {allPromotionsCount === 1 ? 'promotion.' : 'promotions.' }
                            </Typography>
                        </CardContent>
                        <CardActions sx={{position: "absolute", bottom: "0"}}>
                            <Button className="dashboard-btn" size="small" variant="outlined" onClick={() => navigate("/promotion")}>Manage Promotions</Button>
                        </CardActions>
                    </Card>
                    </div>
                    <div className="card-pair">
                    <Card variant="outlined" className="dashboard-card">
                        <CardContent>
                            <Typography className="dashboard-title" gutterBottom variant="h6" component="div">
                                Users
                            </Typography>
                            <Typography variant="body2">
                                There is a total of {allUsersCount} {allUsersCount === 1 ? 'user.' : 'users.' }
                            </Typography>
                        </CardContent>
                        <CardActions sx={{position: "absolute", bottom: "0"}}>
                            <Button className="dashboard-btn" size="small" variant="outlined" onClick={() => navigate("/users")}>Manage Users</Button>
                        </CardActions>
                    </Card>
                    <Card variant="outlined" className="dashboard-card">
                        <CardContent>
                            <Typography className="dashboard-title" gutterBottom variant="h6" component="div">
                                Transactions
                            </Typography>
                            <Typography variant="body2">
                                There is a total of {allTransactionsCount} {allTransactionsCount === 1 ? 'transaction.' : 'transactions.' }
                            </Typography>
                        </CardContent>
                        <CardActions sx={{position: "absolute", bottom: "0"}}>
                            <Button className="dashboard-btn" size="small" variant="outlined" onClick={() => navigate("/transaction")}>Manage Transactions</Button>
                        </CardActions>
                    </Card>
                    </div>
                </div>
            </>
        : (<> {/* Not logged in*/}
            <h1 style={{textAlign: "center"}}>Welcome to the A3 Loyalty Program!</h1>
            <div className="row">
                <Link to="/login">Login</Link>
            </div>
        </>
        )}
    </>;
}

export default Home;