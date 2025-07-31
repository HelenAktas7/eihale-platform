import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
function AdminKullaniciTeklifler() {
    const { kullaniciId } = useParams();
    console.log("URL'den gelen kullanıcı ID:", kullaniciId);
    const [teklifler, setTeklifler] = useState([]);
    useEffect(() => {
        const fetchTeklifler = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5000/admin/kullanici/${kullaniciId}/teklifler`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setTeklifler(data);
                } else {
                    console.error("Gelen veri array değil:", data);
                    setTeklifler([]);
                }
            }
            catch (error) {
                console.error("Veri çekme hatası:", error);
            }

        };
        fetchTeklifler();
    }, [kullaniciId]);
    return (
        <div className="container mt-4">
            <h3>Kullanıcının Teklifleri</h3>
            {teklifler.length === 0 ? (
                <p className="text-muted">Bu kullanıcı henüz teklif vermemiş.</p>
            ) : (
                <ul className="list-group">
                    {teklifler.map((teklif) => (
                        <li key={teklif.id} className="list-group-item">
                            <strong>İhale:</strong> {teklif.ihale_baslik} <br />
                            <strong>Tutar:</strong> {teklif.teklif_miktari} ₺ <br />
                            <strong>Tarih:</strong> {new Date(teklif.teklif_tarihi).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default AdminKullaniciTeklifler;