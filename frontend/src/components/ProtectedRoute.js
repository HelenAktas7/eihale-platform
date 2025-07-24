import { Navigate } from "react-router-dom";
import { isUserLoggedIn } from "../utils/auth";
export default function ProtectedRoute({ children }) {
    const isLoggedIn = isUserLoggedIn();

    if (!isLoggedIn) {
        return <Navigate to="/giris" replace />;
    }
    return children;
}
