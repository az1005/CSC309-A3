import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Success from "./pages/Success";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { DashboardProvider } from "./contexts/DashboardContext";
import Register from "./pages/Register";
import Transaction from "./pages/Transaction";
import { TransactionProvider } from "./contexts/TransactionContext";
import Promotion from "./pages/Promotion";
import { PromotionProvider } from "./contexts/PromotionContext";
import UsersList from "./pages/UsersList";
import Event from "./pages/Event";
import { EventProvider } from "./contexts/EventContext";
import UserPage from "./pages/UserPage";
import PromotionPage from "./pages/PromotionPage";
import TransactionPage from "./pages/TransactionPage";
import EventPage from "./pages/EventPage";


const theme = createTheme();

const MyRoutes = () => {
    return <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/success" element={<Success />} />

            {/* protected routes... */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register"
                element={
                <ProtectedRoute clearanceLevel="cashier">
                    <Register />
                </ProtectedRoute>
                }
            />
            <Route 
                path="/transaction"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <Transaction />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/transaction/:transactionId"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <TransactionPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/promotion"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <Promotion />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/promotion/:promotionId"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <PromotionPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/users"
                element={
                    <ProtectedRoute clearanceLevel="manager">
                        <UsersList />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/users/:userId"
                element={
                    <ProtectedRoute clearanceLevel="manager">
                        <UserPage />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/event"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <Event />
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/event/:eventId"
                element={
                    <ProtectedRoute clearanceLevel="regular">
                        <EventPage />
                    </ProtectedRoute>
                }
            />
            {/* catch-all route */}
            <Route path="*" element={<NotFound />} />
        </Route>

    </Routes>;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <UserProvider>
                    <DashboardProvider>
                        <TransactionProvider>
                            <PromotionProvider>
                                <EventProvider>
                                    <MyRoutes />
                                </EventProvider>
                            </PromotionProvider>
                        </TransactionProvider>
                    </DashboardProvider>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
