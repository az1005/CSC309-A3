// renavigate user to a not found page if they are not properly authorized
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotFound from "../pages/NotFound";

const ProtectedRoute = ({ children, clearanceLevel }) => {
    const { user, authLoading, isLoggingOut } = useAuth();
    
    const rolesOrder = {
        regular: 1,
        cashier: 2,
        manager: 3,
        superuser: 4,
    };

    if (authLoading || isLoggingOut) {
        return <div>Loading...</div>;
    }
    if (!user || rolesOrder[user.role] < rolesOrder[clearanceLevel]) {
        return <NotFound type="unauthorized" />;
    }
    return children;
};

export default ProtectedRoute;
