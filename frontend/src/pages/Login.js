import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [sifre, setSifre] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/kullanici/giris", {
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

            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);

                // Token'ı decode edip rol'e göre yönlendir
                const decoded = JSON.parse(atob(data.token.split(".")[1]));
                const rol = decoded.rol;

                if (rol === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/kullanici");
                }
            } else {
                alert("Giriş başarısız: " + data.hata || "Hatalı giriş.");
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
            alert("Sunucu hatası oluştu.");
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
