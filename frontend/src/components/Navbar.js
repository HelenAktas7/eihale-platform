import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
    let rol = null;
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decoded = jwtDecode(token);
            rol = decoded.rol;
        } catch (e) {
            console.error("Token çözümlenemedi:", e);
        }
    }

    return (
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", background: "#f9f9f9" }}>
            <Link to="/">🏠 Ana Sayfa</Link>{" "}
            {rol === "admin" && (
                <>
                    | <Link to="/admin">⚙️ Admin Paneli</Link>
                </>
            )}
            {rol === "kullanici" && (
                <>
                    | <Link to="/kullanici">👤 Kullanici Paneli</Link>
                </>
            )}
            {rol && (
                <>
                    |{" "}
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/giris";
                        }}
                        style={{
                            marginLeft: "1rem",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Cikis Yap
                    </button>
                </>
            )}
        </nav>
    );
}

export default Navbar;
