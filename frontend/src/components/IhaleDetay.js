import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function IhaleDetay() {
    const { id } = useParams();
    const [ihale, setIhale] = useState(null);
    const [kullaniciId, setKullaniciId] = useState(null);

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
            .then((data) => {
                setIhale(data);
            })
            .catch((error) => {
                console.error("İhale alinamadi:", error);
            });
    }, [id]);


    const teklifVer = () => {
        alert("Teklif verdin gibi düşün 💰");

    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>İhale Detayı</h2>

            {ihale ? (
                <>
                    <p><strong>Başlık:</strong> {ihale.baslik}</p>
                    <p><strong>Açıklama:</strong> {ihale.aciklama}</p>
                    <p><strong>Oluşturan ID:</strong> {ihale.olusturan_id}</p>


                    {kullaniciId && ihale.olusturan_id !== kullaniciId ? (
                        <button onClick={teklifVer}>Teklif Ver</button>
                    ) : (
                        <p style={{ color: "red" }}>
                            Bu ihaleyi sen oluşturdun, teklif veremezsin!
                        </p>
                    )}
                </>
            ) : (
                <p>Yükleniyor...</p>
            )}
        </div>
    );
}

export default IhaleDetay;
