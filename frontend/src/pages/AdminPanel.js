import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


function AdminPanel() {
    const [ihaleler, setIhaleler] = useState([]);
    const [kullanicilar, setKullanicilar] = useState([]);
    const [aramaMetni, setAramaMetni] = useState("");

    const navigate = useNavigate();
    const fetchIhaleler = () => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:5000/ihaleler", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((veri) => setIhaleler(veri))
            .catch((err) => console.error("İhale hatası:", err));
    };

    const handleIhaleSil = async (ihaleId) => {
        const confirmDelete = window.confirm("Bu ihaleyi silmek istiyor musunuz?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/admin/ihale/${ihaleId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
                fetchIhaleler();
            }
        } catch (error) {
            console.error("Aktiflik durumu değiştirilemedi:", error);
        }
    };


    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:5000/ihaleler", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((veri) => setIhaleler(veri))
            .catch((err) => console.error("İhale hatası:", err));

        fetch("http://localhost:5000/admin/kullanicilar", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
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
    return (
        <>
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-6">
                        <h3>İhaleler</h3>
                        {ihaleler.map((ihale) => (
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
                        {kullanicilar.map((kullanici) => (
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
        </>
    );
}

export default AdminPanel;