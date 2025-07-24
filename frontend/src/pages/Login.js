import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
    const [email, setEmail] = useState("");
    const [sifre, setSifre] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const rol = decoded.rol;

                if (rol === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/kullanici");
                }
            } catch (e) {
                console.error("Token geçersiz:", e);
                localStorage.removeItem("token");
            }
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/giris", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    sifre: sifre,
                }),
            });

            const data = await response.json();
            console.log("Gelen veri :", data);

            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);
                const decoded = JSON.parse(atob(data.token.split(".")[1]));
                const rol = decoded.rol;

                if (rol === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/kullanici");
                }
            } else {
                alert("Giriş basarisiz: " + data.hata || "Hatali giriş.");
            }
        } catch (error) {
            console.error("Giriş hatasi:", error);
            alert("Sunucu hatasi oluştu.");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br /><br />
                <input
                    type="password"
                    placeholder="Şifre"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    required
                /><br /><br />
                <button type="submit">Giriş</button>
            </form>
        </div>
    );
}

export default Login;
