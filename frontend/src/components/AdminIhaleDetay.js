import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function AdminIhaleDetay() {
    const { id } = useParams();
    const [teklifler, setTeklifler] = useState([]);
    const [kazanan, setKazanan] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`http://localhost:5000/ihale/${id}/kazanan`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                console.log("Kazanan teklif:", data);
                setKazanan(data);
            });

        fetch(`http://localhost:5000/ihale/${id}/teklifler`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                console.log("Tüm teklifler:", data);
                setTeklifler(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Teklifler fetch hatası:", err);
                setTeklifler([]);
            });

    }, [id]);

    const katilimciSayisi = new Set(teklifler.map(t => t.kullanici_id)).size;
    const enYuksekTeklif = teklifler.reduce((max, t) => t.teklif_miktari > max ? t.teklif_miktari : max, 0);

    const formatTarih = (tarihStr) => {
        if (!tarihStr) return "Tarih yok";
        const date = new Date(tarihStr);
        return isNaN(date.getTime()) ? "Geçersiz Tarih" :
            date.toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">İhale Detayı (Admin Panel)</h3>

            <div className="mb-3">
                <h5>Kazanan Teklif:</h5>
                {kazanan && kazanan.kullanici_id ? (
                    <div className="alert alert-success">
                        Kullanıcı: {kazanan.kullanici_id} |
                        Miktar: {kazanan.teklif_miktari} ₺ |
                        Tarih: {formatTarih(kazanan.teklif_tarihi)}
                    </div>
                ) : (
                    <div className="alert alert-warning">Henüz kazanan teklif bulunamadı</div>
                )}
            </div>

            <div className="mb-3">
                <h5>Katılım Sayısı: {katilimciSayisi}</h5>
                <h6>En Yüksek Teklif: {enYuksekTeklif} ₺</h6>
            </div>

            <div>
                <h5>Tüm Teklifler:</h5>
                {teklifler.length > 0 ? (
                    <ul className="list-group">
                        {Array.isArray(teklifler) && teklifler.map((t) => (
                            <li key={t.id} className="list-group-item d-flex justify-content-between">
                                <span>Kullanıcı: {t.kullanici_id}</span>
                                <span>{t.teklif_miktari} ₺</span>
                                <span>{t.teklif_tarihi
                                    ? new Date(t.teklif_tarihi).toLocaleString("tr-TR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })
                                    : "Tarih yok"}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Henüz teklif yapılmamış.</p>
                )}
            </div>
        </div>
    );
}

export default AdminIhaleDetay;
