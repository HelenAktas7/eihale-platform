import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function UserPanel() {
    const [aktifTab, setAktifTab] = useState("ihalelerim");
    const [ihalelerim, setIhalelerim] = useState([]);
    const [teklifVerdiklerim, setTeklifVerdiklerim] = useState([]);
    const [kazandiklarim, setKazandiklarim] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const BASE_IMAGE_URL = "http://localhost:5000/uploads";

    useEffect(() => {
        const urlMap = {
            ihalelerim: "http://localhost:5000/kullanici/ihalelerim",
            teklifVerdiklerim: "http://localhost:5000/kullanici/tekliflerim",
            kazandiklarim: "http://localhost:5000/kullanici/kazandiklarim",
        };

        fetch(urlMap[aktifTab], {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (aktifTab === "ihalelerim") setIhalelerim(data);
                if (aktifTab === "teklifVerdiklerim") setTeklifVerdiklerim(data);
                if (aktifTab === "kazandiklarim") setKazandiklarim(data);
            })
            .catch((err) => console.error("Veri çekme hatası:", err));
    }, [aktifTab, token]);

    const renderIhaleKartlari = (liste) => {
        if (!Array.isArray(liste) || liste.length === 0) {
            return <p>Gösterilecek veri bulunamadı.</p>;
        }
        return (
            <div className="row">
                {liste.map((ihale) => (
                    <div className="col-md-4 mb-3" key={ihale.id}>
                        <div className="card shadow-sm">

                            {ihale.resimler && ihale.resimler.length > 0 && (
                                <Carousel interval={null}>
                                    {ihale.resimler.map((resim, idx) => (
                                        <Carousel.Item key={idx}>
                                            <img
                                                className="d-block w-100"
                                                src={`${BASE_IMAGE_URL}/${resim}`}
                                                alt={`${ihale.baslik} resmi ${idx + 1}`}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            )}

                            <div className="card-body">

                                <span className={`badge ${ihale.aktif ? "bg-success" : "bg-secondary"} mb-2`}>
                                    {ihale.aktif ? "TEKLİF VERİLEBİLİR" : "KAPANDI"}
                                </span>

                                <h5 className="card-title">{ihale.baslik}</h5>
                                {ihale.konum && <p className="card-text text-muted">{ihale.konum}</p>}

                                <p><strong>Başlangıç Bedeli:</strong> ₺{ihale.baslangic_bedeli?.toLocaleString("tr-TR")}</p>


                                {ihale.bitis_tarihi && (
                                    <p>
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {new Date(ihale.bitis_tarihi).toLocaleString("tr-TR")}
                                    </p>
                                )}

                                {ihale.kategori === "arac" && (
                                    <>
                                        <p><strong>Yıl:</strong> {ihale.ozellikler?.yil ?? "-"}</p>
                                        <p><strong>Km:</strong> {ihale.ozellikler?.km ?? "-"}</p>
                                        <p><strong>Vites:</strong> {ihale.ozellikler?.vites ?? "-"}</p>
                                    </>
                                )}

                                {ihale.kategori === "yapi" && (
                                    <>
                                        <p><strong>Metrekare:</strong> {ihale.ozellikler?.metrekare ?? "-"}</p>
                                        <p><strong>Oda Sayısı:</strong> {ihale.ozellikler?.oda_sayisi ?? "-"}</p>
                                    </>
                                )}

                                {ihale.kategori === "hizmet" && (
                                    <>
                                        <p><strong>Kapsam:</strong> {ihale.ozellikler?.kapsam ?? "-"}</p>
                                        <p><strong>Süre:</strong> {ihale.ozellikler?.hizmet_suresi ?? "-"}</p>
                                    </>
                                )}


                                <button
                                    className="btn btn-primary mt-2"
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
            <div className="mb-4 d-flex gap-2 flex-wrap">
                <button
                    onClick={() => setAktifTab("ihalelerim")}
                    className="btn btn-outline-primary"
                >
                    İhalelerim
                </button>
                <button
                    onClick={() => setAktifTab("teklifVerdiklerim")}
                    className="btn btn-outline-secondary"
                >
                    Teklif Verdiklerim
                </button>
                <button
                    onClick={() => setAktifTab("kazandiklarim")}
                    className="btn btn-outline-success"
                >
                    Kazandıklarım
                </button>
                <Link to="/ihale-olustur" className="btn btn-outline-warning">
                    İhale Oluştur
                </Link>
                <button
                    onClick={() => navigate("/profil")}
                    className="btn btn-outline-dark"
                >
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
