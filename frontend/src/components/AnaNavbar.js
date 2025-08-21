import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AnaNavbar() {
    let rol = null;

    try {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            rol = decoded.rol;
        }
    } catch (err) {
        console.error("Token decode hatası:", err);
    }

    return (
        <div style={{ backgroundColor: "#1b2e59", color: "white", fontFamily: "Arial, sans-serif" }}>

            <div style={{
                backgroundColor: "#172B4D",
                color: "white",
                padding: "0.5rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>📞 444 1 111</span>
                    <span style={{ fontWeight: "bold" }}>|</span>
                    <span>📧 eihale@ticaret.gov.tr</span>
                </div>
            </div>


            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 24px",
                backgroundColor: "#23418e"
            }}>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "2rem",
                        flex: 1
                    }}
                >
                    <Link className="nav-link" to="/" style={{ color: "white", fontWeight: "normal" }}>
                        ANASAYFA
                    </Link>
                    <Link className="nav-link" to="/ihaleler" style={{ color: "white", fontWeight: "normal" }}>
                        İHALELER
                    </Link>
                    <Link className="nav-link" to="/yardim" style={{ color: "white", fontWeight: "normal" }}>
                        YARDIM
                    </Link>
                    <Link className="nav-link" to="/sartlar" style={{ color: "white", fontWeight: "normal" }}>
                        ŞARTLAR
                    </Link>


                    {rol === "admin" && (
                        <Link className="nav-link" to="/admin" style={{ color: "yellow", fontWeight: "bold" }}>
                            ⚙️ ADMIN PANEL
                        </Link>
                    )}
                </div>


                <div style={{ display: "flex", gap: "12px" }}>
                    {!rol ? (
                        <>
                            <Link to="/giris">
                                <button style={{
                                    backgroundColor: "white",
                                    color: "#23418e",
                                    fontWeight: "bold",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}>
                                    ➜ GİRİŞ YAP
                                </button>
                            </Link>
                            <Link to="/uyeol">
                                <button style={{
                                    backgroundColor: "white",
                                    color: "#23418e",
                                    fontWeight: "bold",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}>
                                    👥 ÜYE OL
                                </button>
                            </Link>
                        </>
                    ) : (
                        <Link to="/profil">
                            <button style={{
                                backgroundColor: "white",
                                color: "#23418e",
                                fontWeight: "bold",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}>
                                👤 PROFİLİM
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnaNavbar;
