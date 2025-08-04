import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPanel({ aramaMetni, setAramaMetni }) {
    const [ihaleler, setIhaleler] = useState([]);
    const [kullanicilar, setKullanicilar] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:5000/ihaleler", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((veri) => setIhaleler(veri))
            .catch((err) => console.error("İhale hatası:", err));

        fetch("http://localhost:5000/admin/kullanicilar", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setKullanicilar(data);
                else {
                    console.error("Kullanıcı verisi array değil:", data);
                    setKullanicilar([]);
                }
            })
            .catch(err => {
                console.error("Kullanıcı fetch hatası:", err);
                setKullanicilar([]);
            });
    }, []);
    const [siralama, setSiralama] = useState("artan");
    const [durumFiltre, setDurumFiltre] = useState("tum");
    const handleIhaleSil = async (ihaleId) => {
        const confirmDelete = window.confirm("Bu ihaleyi silmek istiyor musunuz?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/admin/ihale/${ihaleId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            alert(data.mesaj || data.hata);
            if (response.ok) {
                setIhaleler(prev => prev.filter(i => i.id !== ihaleId));
            }
        } catch (error) {
            console.error("Silme hatası:", error);
        }
    };

    const handleKullaniciSil = async (kullaniciId) => {
        const confirmDelete = window.confirm("Bu kullanıcıyı silmek istiyor musunuz?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/admin/kullanici/${kullaniciId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            alert(data.mesaj || data.hata);
            if (response.ok) {
                setKullanicilar(prev => prev.filter(k => k.id !== kullaniciId));
            }
        } catch (error) {
            console.error("Silme hatası:", error);
        }
    };

    const durumDegistir = async (ihale_id, aktif) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/kullanici/ihale/${ihale_id}/durum`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ aktif: aktif ? 1 : 0 })
            });

            const data = await res.json();
            alert(data.mesaj || data.hata);

            if (res.ok) {

                const updated = await fetch("http://localhost:5000/ihaleler", {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json());
                setIhaleler(updated);
            }
        } catch (error) {
            console.error("Aktiflik durumu değiştirilemedi:", error);
        }
    };

    const filtrelenmisIhaleler = ihaleler
        .filter((ihale) => {
            if (!ihale || typeof ihale !== "object") return false;
            if (!ihale.baslik || typeof ihale.baslik !== "string") return false;
            if (aramaMetni && !ihale.baslik.toLowerCase().includes(aramaMetni.toLowerCase())) return false;

            if (durumFiltre === "aktif" && Number(ihale.aktif) !== 1) return false;
            if (durumFiltre === "pasif" && Number(ihale.aktif) !== 0) return false;

            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.bitis_tarihi);
            const dateB = new Date(b.bitis_tarihi);
            return siralama === "artan" ? dateA - dateB : dateB - dateA;
        });

    const filtrelenmisKullanicilar = kullanicilar.filter((kullanici) => {
        if (!kullanici || typeof kullanici !== "object") return false;
        if (!aramaMetni) return true;

        return (
            (kullanici.isim && kullanici.isim.toLowerCase().includes(aramaMetni.toLowerCase())) ||
            (kullanici.email && kullanici.email.toLowerCase().includes(aramaMetni.toLowerCase()))
        );
    });
    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <h3>İhaleler</h3>
                    <div className="mb-3 d-flex gap-3">
                        <div>
                            <label className="form-label">Tarihe Göre Sırala:</label>
                            <select
                                className="form-select"
                                value={siralama}
                                onChange={(e) => setSiralama(e.target.value)}
                            >
                                <option value="artan">Artan (En Yakın)</option>
                                <option value="azalan">Azalan (En Uzak)</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Duruma Göre Filtrele:</label>
                            <select
                                className="form-select"
                                value={durumFiltre}
                                onChange={(e) => setDurumFiltre(e.target.value)}
                            >
                                <option value="tum">Tüm İhaleler</option>
                                <option value="aktif">Sadece Aktif</option>
                                <option value="pasif">Sadece Pasif</option>
                            </select>
                        </div>
                    </div>

                    {filtrelenmisIhaleler.length === 0 && (
                        <p className="text-danger">Aradığınız başlığa uygun ihale bulunamadı.</p>
                    )}
                    {filtrelenmisIhaleler.map((ihale) => (
                        <div key={ihale.id} className="card mb-3 border-danger shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">{ihale.baslik}</h5>
                                <p className="card-text">Bitiş Tarihi: {ihale.bitis_tarihi}</p>
                                <p>
                                    Durum: <span className={`badge ${ihale.aktif ? "bg-success" : "bg-secondary"}`}>
                                        {ihale.aktif ? "Aktif" : "Pasif"}
                                    </span>
                                </p>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => navigate(`/admin/ihale/${ihale.id}`)}>
                                        Detaylı Bilgi
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleIhaleSil(ihale.id)}>
                                        Sil
                                    </button>
                                    {Number(ihale.aktif) === 1 ? (
                                        <button className="btn btn-warning btn-sm" onClick={() => durumDegistir(ihale.id, false)}>
                                            Pasifleştir
                                        </button>
                                    ) : (
                                        <button className="btn btn-success btn-sm" onClick={() => durumDegistir(ihale.id, true)}>
                                            Aktif Et
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-md-6">
                    <h3>Kullanıcılar</h3>
                    {filtrelenmisKullanicilar.length === 0 && (
                        <p className="text-danger">Aradığınız kullanıcı bulunamadı.</p>
                    )}
                    {filtrelenmisKullanicilar.map((kullanici) => (
                        <div key={kullanici.id} className="card mb-3 border-success shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-success fw-bold">{kullanici.isim}</h5>
                                <p className="card-text text-muted">{kullanici.email}</p>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate(`/admin/kullanici/${kullanici.id}/teklifler`)}>
                                        Tekliflerini Gör
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleKullaniciSil(kullanici.id)}>
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
