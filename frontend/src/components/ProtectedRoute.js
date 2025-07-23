import { Navigate } from "react-router-dom";
import { isUserLoggedIn } from "../utils/auth"; // veya "../auth" sen nereye koyduysan

export default function ProtectedRoute({ children }) {
    const isLoggedIn = isUserLoggedIn();

    if (!isLoggedIn) {
        return <Navigate to="/giris" replace />;
    }

    return children;
}
