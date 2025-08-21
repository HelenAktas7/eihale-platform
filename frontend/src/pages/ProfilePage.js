// src/pages/ProfilePage.js
import React, { useEffect, useState } from "react";

function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPass, setSavingPass] = useState(false);

    const [profil, setProfil] = useState({
        isim: "",
        email: "",
        telefon: "",
    });

    const [passForm, setPassForm] = useState({
        eski_sifre: "",
        yeni_sifre: "",
        yeni_sifre_tekrar: "",
    });

    const [alert, setAlert] = useState({ type: "", msg: "" });

    const token = localStorage.getItem("token");

    // Profil bilgilerini çek
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:5000/kullanici/profil", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.hata || "Profil bilgileri alınamadı.");
                }
                setProfil({
                    isim: data.isim || "",
                    email: data.email || "",
                    telefon: data.telefon || "",
                });
            } catch (err) {
                setAlert({ type: "danger", msg: err.message });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setAlert({ type: "", msg: "" });
        setSavingProfile(true);
        try {
            const res = await fetch("http://localhost:5000/kullanici/profil", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(profil),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.hata || "Profil güncellenemedi.");
            }
            setAlert({ type: "success", msg: "Profil başarıyla güncellendi." });
        } catch (err) {
            setAlert({ type: "danger", msg: err.message });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setAlert({ type: "", msg: "" });

        if (!passForm.eski_sifre || !passForm.yeni_sifre || !passForm.yeni_sifre_tekrar) {
            setAlert({ type: "warning", msg: "Lütfen tüm şifre alanlarını doldurun." });
            return;
        }
        if (passForm.yeni_sifre !== passForm.yeni_sifre_tekrar) {
            setAlert({ type: "warning", msg: "Yeni şifre ile tekrarı aynı olmalı." });
            return;
        }
        if (passForm.yeni_sifre.length < 6) {
            setAlert({ type: "warning", msg: "Yeni şifre en az 6 karakter olmalı." });
            return;
        }

        setSavingPass(true);
        try {
            const res = await fetch("http://localhost:5000/kullanici/parola", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eski_sifre: passForm.eski_sifre,
                    yeni_sifre: passForm.yeni_sifre,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.hata || "Şifre güncellenemedi.");
            }
            setAlert({ type: "success", msg: "Şifren başarıyla güncellendi." });
            setPassForm({ eski_sifre: "", yeni_sifre: "", yeni_sifre_tekrar: "" });
        } catch (err) {
            setAlert({ type: "danger", msg: err.message });
        } finally {
            setSavingPass(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <p>Profil yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{ maxWidth: 720 }}>
            <h3 className="mb-3">Profilim</h3>

            {alert.msg && (
                <div className={`alert alert-${alert.type}`} role="alert">
                    {alert.msg}
                </div>
            )}

            <div className="card mb-4">
                <div className="card-header fw-bold">Kişisel Bilgiler</div>
                <div className="card-body">
                    <form onSubmit={handleProfileSave}>
                        <div className="mb-3">
                            <label className="form-label">İsim</label>
                            <input
                                type="text"
                                className="form-control"
                                value={profil.isim}
                                onChange={(e) => setProfil({ ...profil, isim: e.target.value })}
                                placeholder="Ad Soyad"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">E-posta</label>
                            <input
                                type="email"
                                className="form-control"
                                value={profil.email}
                                onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                                placeholder="ornek@mail.com"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Telefon</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={profil.telefon}
                                onChange={(e) => setProfil({ ...profil, telefon: e.target.value })}
                                placeholder="+90 5xx xxx xx xx"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={savingProfile}
                        >
                            {savingProfile ? "Kaydediliyor..." : "Profili Kaydet"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="card mb-5">
                <div className="card-header fw-bold">Şifre Değiştir</div>
                <div className="card-body">
                    <form onSubmit={handlePasswordSave}>
                        <div className="mb-3">
                            <label className="form-label">Eski Şifre</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passForm.eski_sifre}
                                onChange={(e) =>
                                    setPassForm({ ...passForm, eski_sifre: e.target.value })
                                }
                                placeholder="Eski şifreniz"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Yeni Şifre</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passForm.yeni_sifre}
                                onChange={(e) =>
                                    setPassForm({ ...passForm, yeni_sifre: e.target.value })
                                }
                                placeholder="Yeni şifreniz"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passForm.yeni_sifre_tekrar}
                                onChange={(e) =>
                                    setPassForm({ ...passForm, yeni_sifre_tekrar: e.target.value })
                                }
                                placeholder="Yeni şifre tekrar"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-dark"
                            disabled={savingPass}
                        >
                            {savingPass ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
