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
            .then(data => setKazanan(data));

        fetch(`http://localhost:5000/ihale/${id}/teklifler`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTeklifler(data));

    }, [id]);

    const katilimciSayisi = new Set(teklifler.map(t => t.kullanici_id)).size;
    const enYuksekTeklif = teklifler.reduce((max, t) => t.teklif_miktari > max ? t.teklif_miktari : max, 0);

    return (
        <div className="container mt-4">
            <h3 className="mb-4">İhale Detayı (Admin Panel)</h3>

            <div className="mb-3">
                <h5>Kazanan Teklif:</h5>
                {kazanan ? (
                    <div className="alert alert-success">
                        Kullanıcı: {kazanan.kullanici_id} | Miktar: {kazanan.teklif_miktari} ₺ | Tarih: {new Date(kazanan.teklif_tarihi).toLocaleString()}
                    </div>
                ) : (
                    <div className="alert alert-warning">Henüz kazanan yok</div>
                )}
            </div>

            <div className="mb-3">
                <h5>Katılım Sayısı: {katilimciSayisi}</h5>
                <h6>En Yüksek Teklif: {enYuksekTeklif} ₺</h6>
            </div>

            <div>
                <h5>Tüm Teklifler:</h5>
                <ul className="list-group">
                    {teklifler.map((t) => (
                        <li key={t.id} className="list-group-item d-flex justify-content-between">
                            <span>Kullanıcı: {t.kullanici_id}</span>
                            <span>{t.teklif_miktari} ₺</span>
                            <span>{new Date(t.teklif_tarihi).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AdminIhaleDetay;
