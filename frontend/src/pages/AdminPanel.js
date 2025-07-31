import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
    const [ihaleler, setIhaleler] = useState([]);
    const [kullanicilar, setKullanicilar] = useState([]);
    const navigate = useNavigate();
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
            }
        } catch (error) {
            console.error("Silme hatası:", error);
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
            .catch((err) => console.error("Hata:", err));

        fetch("http://localhost:5000/admin/kullanicilar", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(data => setKullanicilar(data));
    }, []);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <h3>İhaleler</h3>
                    {ihaleler.map((ihale) => (
                        <div
                            key={ihale.id}
                            className="card mb-3 border-danger shadow-sm transition-all"
                            style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.classList.add("shadow-lg");
                                e.currentTarget.style.transform = "scale(1.02)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.classList.remove("shadow-lg");
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <div className="card-body">
                                <h5 className="card-title text-primary">{ihale.baslik}</h5>
                                <p className="card-text">Bitiş Tarihi: {ihale.bitis_tarihi}</p>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => navigate(`/admin/ihale/${ihale.id}`)}
                                    >
                                        Detaylı Bilgi
                                    </button>

                                    <button
                                        onClick={() => handleIhaleSil(ihale.id)}
                                        className="btn btn-danger"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                <div className="col-md-6">
                    <h3>Kullanıcılar</h3>
                    {kullanicilar.map((kullanici, index) => (
                        <div
                            key={index}
                            className="card mb-3 border-success shadow-sm"
                            style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.03)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 128, 0, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                            }}
                        >
                            <div className="card-body">
                                <h5 className="card-title text-success fw-bold">{kullanici.isim}</h5>
                                <p className="card-text text-muted">{kullanici.email}</p>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate(`/admin/kullanici/${kullanici.id}/teklifler`)}
                                    >
                                        Tekliflerini Gör
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleKullaniciSil(kullanici.id)}
                                    >
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
