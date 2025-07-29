import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
    const [ihaleler, setIhaleler] = useState([]);
    const navigate = useNavigate();

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
    }, []);

    return (
        <div className="container my-4">
            {ihaleler.map((ihale) => (
                <div
                    key={ihale.id}
                    className="card mb-4 shadow-sm card-hover-effect"
                    style={{
                        padding: "20px",
                        border: "1px solid #7c0a02",
                        background: "fff5f7"
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="card-title text-primary">{ihale.baslik}</h5>
                            <p className="card-text text-muted">
                                Bitiş Tarihi:{" "}
                                {new Date(ihale.bitis_tarihi).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/admin/ihale/${ihale.id}`)}
                            className="btn btn-outline-primary"
                        >
                            Detaylı Bilgi
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminPanel;
