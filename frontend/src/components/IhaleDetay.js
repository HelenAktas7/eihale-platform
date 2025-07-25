import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function IhaleDetay() {
    const { id } = useParams();
    const [ihale, setIhale] = useState(null);
    const [kullaniciId, setKullaniciId] = useState(null);
    const [teklifTutari, setTeklifTutari] = useState("");
    const [teklifler, setTeklifler] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:5000/ihale/${id}/teklifler`)
            .then(res => res.json())
            .then(data => setTeklifler(data))
            .catch(err => console.error("Teklifler Yuklenemedi", err))
    }, [id]
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setKullaniciId(decoded.id);
            } catch (e) {
                console.error("Token çözümleme hatasi:", e);
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ihale_id: id,
                    kullanici_id: decoded.id,
                    tutar: parseFloat(teklifTutari),
                    teklif_tarihi: new Date().toISOString()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(" Teklif başarıyla gönderildi!");
                setTeklifTutari("");
            } else {
                alert(" Hata: " + (data.error || data.message));
            }

        } catch (error) {
            console.error("Teklif gönderme hatası:", error);
            alert("Sunucu hatası oluştu.");
        }
    };

    useEffect(() => {
        fetch(`http://localhost:5000/ihale/${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Backend'den gelen ihale:", data);
                setIhale(data);
            })
            .catch((error) => {
                console.error("İhale alinamadi:", error);
            });
    }, [id]);




    return (
        <div style={{ padding: "2rem" }}>
            <h2>İhale Detayı</h2>

            {ihale ? (
                <>
                    <p><strong>Başlık:</strong> {ihale.baslik}</p>
                    <p><strong>Açıklama:</strong> {ihale.aciklama}</p>
                    <p><strong>Oluşturan ID:</strong> {ihale.olusturan_id}</p>


                    {ihale && kullaniciId ? (
                        ihale.olusturan_id !== kullaniciId ? (
                            <form onSubmit={handleTeklifGonder}>
                                <label>Teklif Tutarı:</label><br />
                                <input
                                    type="number"
                                    value={teklifTutari}
                                    onChange={(e) => setTeklifTutari(e.target.value)}
                                    required
                                />
                                <br /><br />
                                <button type="submit">Teklif Ver</button>
                            </form>
                        ) : (
                            <p style={{ color: "red" }}>Bu ihaleyi sen oluşturdun, teklif veremezsin!</p>
                        )
                    ) : (
                        <p>Yükleniyor...</p>
                    )}

                </>
            ) : (
                <p>Yükleniyor...</p>
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
                                <td>{teklif.teklif_miktari}</td>
                                <td>{new Date(teklif.teklif_tarihi).toLocaleString()}</td>
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
