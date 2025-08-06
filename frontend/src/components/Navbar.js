import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Navbar({ aramaMetni, setAramaMetni }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    let rol = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            rol = decoded.rol;
        } catch (e) {
            console.error("Token çözümlenemedi:", e);
        }
    }
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/giris");
    }
    return (
        <nav style={{
            padding: "1rem",
            borderBottom: "1px solid #ccc",
            backgroundColor: "#f0f0f0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between"
        }}>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link to="/" className="nav-link" style={{ fontWeight: "bold", fontSize: "18px" }}>
                    🏛 E-İhale Platformu
                </Link>
                <Link to="/" className="nav-link">🏠 Ana Sayfa</Link>
                {rol === "admin" && <Link to="/admin" className="nav-link">⚙️ Admin Paneli</Link>}
                {rol === "kullanici" && <Link to="/kullanici" className="nav-link">👤 Kullanıcı Paneli</Link>}
                {rol === "admin" && <Link to="/arsiv" className="nav-link">📁 Arşiv</Link>}
            </div>


            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
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
                {rol ? (
                    <button onClick={handleLogout}
                        style={{
                            background: "#e74c3c",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}>
                        🔒 Çıkış Yap
                    </button>
                ) : (
                    <Link to="/giris"
                        style={{
                            background: "#3498db",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            textDecoration: "none"
                        }}>
                        🔑 Giriş Yap
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
