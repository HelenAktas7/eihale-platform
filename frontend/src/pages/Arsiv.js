import React, { useEffect, useState } from "react";
function Arsiv() {
    const [ihaleler, setIhaleler] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:5000/ihaleler", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setIhaleler(data))
            .catch(err => console.error("Arşiv ihaleleri fetch hatası:", err));
    }, []);
    const pasifIhaleler = ihaleler.filter((ihale) => Number(ihale.aktif) === 0);
    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">📦 Kapanan İhaleler (Arşiv)</h2>
            {pasifIhaleler.length === 0 ? (
                <p className="text-muted text-center">Şu anda arşivde ihale bulunmamaktadır.</p>
            ) : (
                pasifIhaleler.map((ihale) => (
                    <div key={ihale.id} className="card mb-3 border-secondary shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-dark">{ihale.baslik}</h5>
                            <p className="card-text">Bitiş Tarihi: {ihale.bitis_tarihi}</p>
                            <span className="badge bg-secondary">Kapalı</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
export default Arsiv;

