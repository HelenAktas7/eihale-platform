import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnaNavbar from "../components/AnaNavbar";

export default function UyeOl() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        isim: "",
        soyad: "",
        email: "",
        telefon: "90",
        sifre: "",
        sifreTekrar: "",
        kosul: false,
    });

    const [gosterSifre, setGosterSifre] = useState(false);
    const [gosterSifre2, setGosterSifre2] = useState(false);
    const [hata, setHata] = useState("");
    const [loading, setLoading] = useState(false);
    const btnDisabled =
        !form.kosul ||
        !form.isim.trim() ||
        !form.soyad.trim() ||
        !form.email.trim() ||
        !form.sifre ||
        !form.sifreTekrar;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const validate = () => {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        if (!emailOk) return "Lütfen geçerli bir e-posta girin.";
        if (form.sifre.length < 6) return "Şifre en az 6 karakter olmalı.";
        if (form.sifre !== form.sifreTekrar) return "Şifreler eşleşmiyor.";
        if (!form.kosul) return "Üyelik koşullarını kabul etmelisiniz.";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHata("");
        const v = validate();
        if (v) {
            setHata(v);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/uyeol", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isim: form.isim.trim(),
                    soyad: form.soyad.trim(),
                    email: form.email.trim().toLowerCase(),
                    telefon: form.telefon.trim(),
                    sifre: form.sifre,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setHata(data.hata || "Kayıt başarısız.");
                return;
            }
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            navigate("/giris");
        } catch (err) {
            setHata("Sunucu hatası.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnaNavbar />
            <div style={st.page}>
                <div style={st.wrap}>
                    <div style={st.card}>
                        <div style={st.body}>
                            <h3 style={st.headerText}>ÜYE OL</h3>
                            <p style={st.sub}>
                                Zaten üye misiniz?{" "}
                                <span style={st.link} onClick={() => navigate("/giris")} role="button">
                                    Giriş yapın!
                                </span>
                            </p>

                            {hata && <div style={st.err}>{hata}</div>}

                            <form onSubmit={handleSubmit} style={st.form}>
                                <div style={st.group}>
                                    <span style={st.leftIcon}>👤</span>
                                    <input
                                        name="isim"
                                        placeholder="Isim *"
                                        value={form.isim}
                                        onChange={handleChange}
                                        style={st.input}
                                        required
                                    />
                                </div>

                                <div style={st.group}>
                                    <span style={st.leftIcon}>👤</span>
                                    <input
                                        name="soyad"
                                        placeholder="Soyad *"
                                        value={form.soyad}
                                        onChange={handleChange}
                                        style={st.input}
                                        required
                                    />
                                </div>

                                <div style={st.group}>
                                    <span style={st.leftIcon}>🔒</span>
                                    <input
                                        name="sifre"
                                        type={gosterSifre ? "text" : "password"}
                                        placeholder="Şifre *"
                                        value={form.sifre}
                                        onChange={handleChange}
                                        style={st.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setGosterSifre((s) => !s)}
                                        style={st.eye}
                                    >
                                        {gosterSifre ? "🙈" : "👁️"}
                                    </button>
                                </div>

                                <div style={st.group}>
                                    <span style={st.leftIcon}>🔒</span>
                                    <input
                                        name="sifreTekrar"
                                        type={gosterSifre2 ? "text" : "password"}
                                        placeholder="Şifre Tekrar *"
                                        value={form.sifreTekrar}
                                        onChange={handleChange}
                                        style={st.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setGosterSifre2((s) => !s)}
                                        style={st.eye}
                                    >
                                        {gosterSifre2 ? "🙈" : "👁️"}
                                    </button>
                                </div>

                                <div style={st.group}>
                                    <span style={st.leftIcon}>📧</span>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="E-Posta *"
                                        value={form.email}
                                        onChange={handleChange}
                                        style={st.input}
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                <div style={st.group}>
                                    <span style={st.leftIcon}>📱</span>
                                    <input
                                        name="telefon"
                                        placeholder="Cep Telefonu *"
                                        value={form.telefon}
                                        onChange={handleChange}
                                        style={st.input}
                                    />
                                </div>

                                <label style={st.kosulRow}>
                                    <input
                                        type="checkbox"
                                        name="kosul"
                                        checked={form.kosul}
                                        onChange={handleChange}
                                        style={{ marginRight: 8 }}
                                    />
                                    Üyelik koşullarını kabul et
                                </label>

                                <button type="submit" style={st.btn} disabled={btnDisabled || loading}>
                                    {loading ? "Gönderiliyor..." : "ÜYE OL"}
                                </button>
                            </form>

                            <div style={st.hr} />
                            <p style={{ textAlign: "center", marginTop: 8 }}>
                                Üye olan kullanıcılar üyelik koşullarını kabul etmiş sayılmaktadır.
                            </p>
                            <p style={{ textAlign: "center" }}>
                                <span style={st.link}
                                    role="button"
                                    onClick={() => navigate("/kullanicisozlesmesi")}
                                >Üyelik Koşulları</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const blue = "#23418e";
const pink = "#ea1d5d";

const st = {
    page: {
        minHeight: "100vh",
        background: "#f6f8fb",
        fontFamily: "Inter, system-ui"
    },
    wrap: {
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px"
    },
    card: {
        width: "100%",
        maxWidth: 720,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 10px 24px rgba(0,0,0,.08)"
    },
    body: { padding: 24 },
    headerText: {
        textAlign: "center",
        fontSize: 22, fontWeight: 800,
        margin: "4px 0 12px"
    },
    sub: {
        textAlign: "center",
        color: "#9b1c31",
        fontWeight: 700,
        marginBottom: 16
    },
    link: {
        color: blue,
        textDecoration: "underline",
        cursor: "pointer",
        fontWeight: 700
    },
    err: {
        background: "#ffe6e6",
        border: "1px solid #ffb3b3",
        color: "#990000",
        padding: "8px 12px",
        borderRadius: 8,
        marginBottom: 12
    },
    form: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
    },
    group: {
        position: "relative",
        gridColumn: "span 1"
    },
    leftIcon: {
        position: "absolute",
        left: 12, top: "50%", transform: "translateY(-50%)", opacity: .6
    },
    input: {
        width: "100%", height: 44,
        padding: "0 44px 0 36px",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        outline: "none"
    },
    eye: {
        position: "absolute",
        right: 8, top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        fontSize: 18
    },
    kosulRow: {
        gridColumn: "span 2",
        display: "flex",
        alignItems: "center",
        marginTop: 8
    },
    btn: {
        gridColumn: "span 2",
        height: 46,
        background: pink,
        color: "#fff",
        border: 0,
        borderRadius: 8,
        fontWeight: 800,
        cursor: "pointer"
    },
    hr: {
        height: 1,
        background: "#e5e7eb", marginTop: 16
    },
};
