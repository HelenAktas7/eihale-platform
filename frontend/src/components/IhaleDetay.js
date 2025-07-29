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

    const [duzenlemeModu, setDuzenlemeModu] = useState(null);
    const [guncelTutar, setGuncelTutar] = useState("");

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

    const teklifGuncelle = async (teklifId) => {
        try {
            const response = await fetch(`http://localhost:5000/teklif/${teklifId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    yeni_miktar: parseFloat(guncelTutar),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Teklif başarıyla güncellendi!");
                setDuzenlemeModu(null);
                setGuncelTutar("");
                fetch(`http://localhost:5000/ihale/${id}/teklifler`)
                    .then(res => res.json())
                    .then(data => setTeklifler(data));
            } else {
                alert("Hata: " + (data.error || data.message));
            }
        } catch (error) {
            console.error("Teklif güncelleme hatası:", error);
            alert("Sunucu hatası oluştu.");
        }
    };

    const teklifSil = async (teklifId) => {
        const onay = window.confirm("Bu teklifi silmek istediğinize emin misiniz?");
        if (!onay) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/teklif/${teklifId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                alert("Teklif başarıyla silindi!");
                setTeklifler(teklifler.filter(t => t.id !== teklifId));
            } else {
                alert("Hata: " + (data.hata || data.mesaj));
            }
        } catch (err) {
            alert("Sunucu hatası: " + err.message);
        }
    };

    useEffect(() => {
        fetch(`http://localhost:5000/ihale/${id}`)
            .then((res) => res.json())
            .then((data) => setIhale(data))
            .catch((error) => console.error("İhale alınamadı:", error));
    }, [id]);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>İhale Detayı</h2>

            {ihale ? (
                <>
                    <p><strong>Başlık:</strong> {ihale.baslik}</p>
                    <p><strong>Açıklama:</strong> {ihale.aciklama}</p>
                    <p><strong>Oluşturan ID:</strong> {ihale.olusturan_id}</p>

                    {kullaniciId && ihale.olusturan_id !== kullaniciId ? (
                        <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "2rem", borderRadius: "5px" }}>
                            <h4>Yeni Teklif Ver</h4>
                            <form onSubmit={handleTeklifGonder}>
                                <input
                                    type="number"
                                    value={teklifTutari}
                                    onChange={(e) => setTeklifTutari(e.target.value)}
                                    required
                                    placeholder="Teklif Tutarı (₺)"
                                />
                                <br /><br />
                                <button style={{
                                    backgroundColor: "#4CAF50", color: "white",
                                    border: "none", padding: "6px 12px", cursor: "pointer"
                                }} type="submit">Teklif Ver</button>
                            </form>
                        </div>
                    ) : (
                        <p style={{ color: "red" }}>Bu ihaleyi sen oluşturdun, teklif veremezsin!</p>
                    )}
                </>
            ) : (
                <p style={{ fontStyle: "italic", color: "#888" }}>İhale verisi yükleniyor...</p>
            )}

            <h3>Verilen Teklifler</h3>
            {teklifler.length > 0 ? (
                <table border="1" cellPadding="10" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Kullanıcı ID</th>
                            <th>Teklif Tutarı (₺)</th>
                            <th>Teklif Tarihi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teklifler.map((teklif, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{teklif.kullanici_id}</td>
                                <td>
                                    {duzenlemeModu === teklif.id ? (
                                        <>
                                            <input
                                                type="number"
                                                value={guncelTutar}
                                                onChange={(e) => setGuncelTutar(e.target.value)}
                                            />
                                            <button onClick={() => teklifGuncelle(teklif.id)}>Kaydet</button>
                                            <button onClick={() => setDuzenlemeModu(null)}>İptal</button>
                                        </>
                                    ) : (
                                        <>
                                            {teklif.miktar} ₺
                                            {kullaniciId === teklif.kullanici_id && (
                                                <>
                                                    <button
                                                        style={{ marginLeft: "10px" }}
                                                        onClick={() => {
                                                            setDuzenlemeModu(teklif.id);
                                                            setGuncelTutar(teklif.miktar);
                                                        }}
                                                    >
                                                        Düzenle
                                                    </button>

                                                    <button
                                                        style={{ marginLeft: "5px", color: "red" }}
                                                        onClick={() => teklifSil(teklif.id)}
                                                    >
                                                        Sil
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </td>
                                <td>{new Date(teklif.tarih).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Bu ihaleye henüz teklif verilmemiş.</p>
            )}
        </div>
    );
}

export default IhaleDetay;
