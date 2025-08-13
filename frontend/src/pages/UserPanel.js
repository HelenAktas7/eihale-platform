import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from "react-bootstrap";

function UserPanel() {
    const [aktifTab, setAktifTab] = useState("ihalelerim");
    const [ihalelerim, setIhalelerim] = useState([]);
    const [teklifVerdiklerim, setTeklifVerdiklerim] = useState([]);
    const [kazandiklarim, setKazandiklarim] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (aktifTab === "ihalelerim") {
            fetch("http://localhost:5000/kullanici/ihalelerim", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => setIhalelerim(data));
        } else if (aktifTab === "teklifVerdiklerim") {
            fetch("http://localhost:5000/kullanici/tekliflerim", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => setTeklifVerdiklerim(data));
        } else if (aktifTab === "kazandiklarim") {
            fetch("http://localhost:5000/kullanici/kazandiklarim", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => setKazandiklarim(data));
        }
    }, [aktifTab]);

    const renderIhaleKartlari = (liste) => {
        if (!Array.isArray(liste)) {
            return <p>Gösterilecek veri bulunamadı.</p>;
        }
        return (
            <div className="row">
                {liste.map((ihale) => (
                    <div className="col-md-4 mb-3" key={ihale.id}>
                        <div className="card shadow-sm">
                            <Carousel>
                                {ihale.resimler?.map((resim, idx) => (
                                    <Carousel.Item key={idx}>
                                        <img
                                            className="d-block w-100"
                                            src={`http://localhost:5000/uploads/${resim}`}
                                            alt="İhale Görseli"
                                            style={{ height: "200px", objectFit: "cover" }}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                            <div className="card-body">
                                <h5 className="card-title">{ihale.baslik}</h5>
                                <p className="card-text">{ihale.konum}</p>
                                <p className="card-text">
                                    <strong>B. Bedeli:</strong> ₺{ihale.baslangic_bedeli}
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/ihale/${ihale.id}`)}
                                >
                                    Detay
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mt-4">
            <div className="mb-4 d-flex gap-2">
                <button onClick={() => setAktifTab("ihalelerim")} className="btn btn-outline-primary">
                    İhalelerim
                </button>
                <button onClick={() => setAktifTab("teklifVerdiklerim")} className="btn btn-outline-secondary">
                    Teklif Verdiklerim
                </button>
                <button onClick={() => setAktifTab("kazandiklarim")} className="btn btn-outline-success">
                    Kazandıklarım
                </button>
                <Link to="/ihale-olustur" className="btn btn-outline-warning">
                    İhale Oluştur
                </Link>
                <button onClick={() => navigate("/profil")} className="btn btn-outline-dark">
                    Profil
                </button>
            </div>

            {aktifTab === "ihalelerim" && renderIhaleKartlari(ihalelerim)}
            {aktifTab === "teklifVerdiklerim" && renderIhaleKartlari(teklifVerdiklerim)}
            {aktifTab === "kazandiklarim" && renderIhaleKartlari(kazandiklarim)}
        </div>
    );
}

export default UserPanel;
