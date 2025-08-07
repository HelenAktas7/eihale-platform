import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function IhaleDetay() {
    const { id } = useParams();
    const [ihale, setIhale] = useState(null);
    const [kullaniciId, setKullaniciId] = useState(null);
    const [teklifTutari, setTeklifTutari] = useState("");
    const [teklifler, setTeklifler] = useState([]);
    const [kazanan, setKazanan] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/ihale/${id}/teklifler`)
            .then(res => res.json())
            .then(data => setTeklifler(data))
            .catch(err => console.error("Teklifler Yüklenemedi", err));
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setKullaniciId(decoded.id);
            } catch (e) {
                console.error("Token çözümleme hatası:", e);
                localStorage.removeItem("token");
            }
        }
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/ihale/${id}`)
            .then((res) => res.json())
            .then((data) => setIhale(data))
            .catch((error) => console.error("İhale alınamadı:", error));
    }, [id]);

    const handleTeklifGonder = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const decoded = jwtDecode(token);

            const response = await fetch("http://localhost:5000/teklif", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ihale_id: id,
                    kullanici_id: decoded.id,
                    tutar: parseFloat(teklifTutari),
                    teklif_tarihi: new Date().toISOString()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Teklif başarıyla gönderildi!");
                setTeklifTutari("");
                fetch(`http://localhost:5000/ihale/${id}/teklifler`)
                    .then(res => res.json())
                    .then(data => setTeklifler(data));
            } else {
                alert("Hata: " + (data.error || data.message));
            }

        } catch (error) {
            console.error("Teklif gönderme hatası:", error);
            alert("Sunucu hatası oluştu.");
        }
    };

    return (
        <div className="container py-4">
            {ihale ? (
                <>

                    <div className="card shadow-sm mb-4">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="card-title mb-2" style={{ fontWeight: "bold" }}>
                                    {ihale.baslik}
                                </h5>
                                <p className="card-subtitle text-muted mb-0">
                                    <i className="bi bi-geo-alt-fill me-2"></i>
                                    {ihale.konum || "Konum bilgisi yok"}
                                </p>
                            </div>

                            <div>
                                <span className="text-muted">İhale No: </span>
                                <span className="fw-bold text-primary">{ihale.id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">

                        <div className="col-md-8">
                            <img
                                src={ihale.resimURL || "/placeholder.jpg"}
                                alt={ihale.baslik}
                                className="img-fluid rounded mb-3"
                            />

                            {kullaniciId && ihale.olusturan_id !== kullaniciId ? (
                                <div className="card p-3 mb-4">
                                    <h5>Yeni Teklif Ver</h5>
                                    <form onSubmit={handleTeklifGonder} className="d-flex gap-2">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Teklif Tutarı (₺)"
                                            value={teklifTutari}
                                            onChange={(e) => setTeklifTutari(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn btn-primary">Teklif Ver</button>
                                    </form>
                                </div>
                            ) : (
                                <p className="text-danger">Bu ihaleyi sen oluşturdun, teklif veremezsin!</p>
                            )}
                        </div>


                        <div className="col-md-4">
                            <div className="card p-3">
                                <h5 className="text-center">TEKLİF DURUMU</h5>
                                <h4 className="text-center text-primary mb-3">
                                    Güncel Fiyat: ₺{teklifler?.[0]?.miktar ? Number(teklifler[0].miktar).toLocaleString("tr-TR") : "0"}
                                </h4>

                                <ul className="list-group mb-3">
                                    {teklifler.map((t, i) => (
                                        <li className="list-group-item d-flex justify-content-between" key={i}>
                                            <span>{t.kullanici_id.slice(0, 8).toUpperCase()}</span>
                                            <span>₺{Number(t.miktar).toLocaleString("tr-TR")}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="bg-dark text-white text-center py-2 rounded">
                                    <strong>0</strong> Saat <strong>0</strong> Dakika <strong>0</strong> Saniye
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p>İhale verisi yükleniyor...</p>
            )}
        </div>
    );
}

export default IhaleDetay;
