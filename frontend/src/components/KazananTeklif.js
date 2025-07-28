import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function KazananTeklif() {
    const { ihale_id } = useParams();
    const [kazanan, setKazanan] = useState(null);
    const [hata, setHata] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        fetch(`http://localhost:5000/ihale/${ihale_id}/kazanan`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

            .then(res => res.json())
            .then(data => {
                if (data.hata || data.mesaj) {
                    setHata(data.hata || data.mesaj);
                } else {
                    setKazanan(data);
                }
            })
            .catch(err => setHata("Sunucu hatası: " + err.message));
    }, [ihale_id]);

    return (
        <div>
            <h2>Kazanan Teklif</h2>
            {hata && <p style={{ color: "red" }}>{hata}</p>}
            {kazanan ? (
                <ul>
                    <li><strong>Kullanıcı ID:</strong> {kazanan.kullanici_id}</li>
                    <li><strong>Teklif:</strong> {kazanan.teklif_miktari} TL</li>
                    <li><strong>Tarih:</strong> {kazanan.teklif_tarihi}</li>
                </ul>
            ) : !hata && <p>Yükleniyor...</p>}
        </div>
    );
}

export default KazananTeklif;
