import jwt_decode from "jwt-decode";

export function getToken() {
    return localStorage.getItem("token");
}

export function getUserInfo() {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwt_decode(token);
        return decoded;
    } catch (error) {
        console.error("Token çözümlenemedi:", error);
        return null;
    }
}

export function isUserLoggedIn() {
    return !!getUserInfo();
}

export function isUserAdmin() {
    const user = getUserInfo();
    return user?.role === "admin";
}

