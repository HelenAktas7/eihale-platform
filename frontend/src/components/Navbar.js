import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar({ aramaMetni, setAramaMetni }) {
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
        <nav
            style={{
                padding: "1rem",
                borderBottom: "1px solid #ccc",
                background: "#f9f9f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Link to="/">🏠 Ana Sayfa</Link>
                {rol === "admin" && <Link to="/admin">⚙️ Admin Paneli</Link>}
                {rol === "kullanici" && <Link to="/kullanici">👤 Kullanıcı Paneli</Link>}
                {rol && (
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/giris";
                        }}
                        style={{
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Çıkış Yap
                    </button>
                )}
            </div>

            {rol === "admin" && (
                <input
                    type="text"
                    placeholder="Başlığa göre ara..."
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    style={{
                        padding: "0.4rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        minWidth: "250px"
                    }}
                />
            )}
        </nav>
    );
}

export default Navbar;
