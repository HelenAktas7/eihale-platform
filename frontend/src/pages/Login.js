import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AnaNavbar from "../components/AnaNavbar";

function Login() {
    const [email, setEmail] = useState("");
    const [sifre, setSifre] = useState("");
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const rol = decoded.rol;
                if (rol === "admin") navigate("/admin");
                else navigate("/kullanici");
            } catch (e) {
                console.error("Token geçersiz:", e);
                localStorage.removeItem("token");
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/giris", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, sifre }),
            });
            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);
                const decoded = jwtDecode(data.token);
                const rol = decoded.rol;
                if (rol === "admin") navigate("/admin");
                else navigate("/kullanici");
            } else {
                alert("Giriş başarısız: " + (data.hata || "Hatalı giriş."));
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
            alert("Sunucu hatası oluştu.");
        }
    };

    return (
        <>
            <AnaNavbar />
            <div style={styles.page}>
                <div style={styles.cardWrap}>
                    <div style={styles.card}>
                        <div style={styles.cardBody}>
                            <h2 style={styles.title}>GİRİŞ YAP</h2>

                            <p style={styles.subtext}>
                                Henüz üye değil misiniz?{" "}
                                <span
                                    style={styles.link}
                                    onClick={() => navigate("/uyeol")}
                                    role="button"
                                >
                                    Üye Ol
                                </span>
                            </p>

                            <form onSubmit={handleLogin} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <span style={styles.leftIcon}>📧</span>
                                    <input
                                        type="email"
                                        placeholder="E-posta *"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <span style={styles.leftIcon}>🔒</span>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Şifre *"
                                        value={sifre}
                                        onChange={(e) => setSifre(e.target.value)}
                                        required
                                        style={styles.input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((s) => !s)}
                                        style={styles.eyeBtn}
                                    >
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </div>

                                <button type="submit" style={styles.loginBtn}>
                                    GİRİŞ YAP
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const blue = "#23418e";
const yellow = "#f3b300";

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f6f8fb",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },
    cardWrap: {
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
    },
    card: {
        width: "100%",
        maxWidth: 420,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
    },
    cardBody: { padding: "28px" },
    title: {
        textAlign: "center",
        margin: "0 0 18px",
        color: "#1e2a3a",
        fontSize: 26,
        fontWeight: 800,
    },
    subtext: {
        textAlign: "center",
        marginBottom: 20,
        color: "#6b7280",
        fontSize: 14,
    },
    link: {
        color: blue,
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "underline",
    },
    form: { display: "grid", gap: 16 },
    inputGroup: { position: "relative" },
    leftIcon: {
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        opacity: 0.7,
    },
    input: {
        width: "100%",
        height: 44,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        padding: "0 44px 0 40px",
        outline: "none",
        fontSize: 15,
    },
    eyeBtn: {
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 18,
    },
    loginBtn: {
        height: 46,
        background: yellow,
        color: "#2b2b2b",
        border: "none",
        borderRadius: 8,
        fontWeight: 800,
        cursor: "pointer",
    },
};

export default Login;
