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

    const urlMap = {
        ihalelerim: "http://localhost:5000/kullanici/ihalelerim",
        teklifVerdiklerim: "http://localhost:5000/kullanici/tekliflerim",
        kazandiklarim: "http://localhost:5000/kullanici/kazandiklarim",
    };

    const fetchAktifSekme = async () => {
        try {
            const res = await fetch(urlMap[aktifTab], {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (aktifTab === "ihalelerim") setIhalelerim(Array.isArray(data) ? data : []);
            if (aktifTab === "teklifVerdiklerim") setTeklifVerdiklerim(Array.isArray(data) ? data : []);
            if (aktifTab === "kazandiklarim") setKazandiklarim(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Veri çekme hatası:", err);
        }
    };

    useEffect(() => {
        fetchAktifSekme();
    }, [aktifTab, token]);

    const handleIptal = async (teklifId) => {
        if (!teklifId) return;
        if (!window.confirm("Bu teklifi iptal etmek istiyor musunuz?")) return;

        try {
            const res = await fetch(`http://localhost:5000/teklif/${teklifId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data?.error || "İptal başarısız.");
                return;
            }
            alert("Teklif iptal edildi.");
            if (aktifTab === "teklifVerdiklerim") fetchAktifSekme();
        } catch (err) {
            console.error("İptal hatası:", err);
            alert("Sunucu hatası.");
        }
    };

    const paraFormat = (deger) => {
        if (!deger) return "0";
        const sayi = typeof deger === "number" ? deger : parseInt(deger.toString().replace(/\D/g, "")) || 0;
        return sayi.toLocaleString("tr-TR");
    };

    const renderIhaleKartlari = (liste, { teklifKart = false } = {}) => {
        if (!Array.isArray(liste) || liste.length === 0) {
            return <p>Gösterilecek veri bulunamadı.</p>;
        }

        return (
            <div className="row">
                {liste.map((ihale) => {
                    const teklifId = ihale.teklif_id ?? ihale.teklifId ?? ihale.id_teklif;
                    const ihaleKapali =
                        ihale.aktif === 0 ||
                        ihale.aktif === false ||
                        (ihale.bitis_tarihi && new Date(ihale.bitis_tarihi) < new Date());

                    return (
                        <div className="col-md-4 mb-3" key={`${ihale.id}-${teklifId || "x"}`}>
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
                                    <span className={`badge ${!ihaleKapali ? "bg-success" : "bg-secondary"} mb-2`}>
                                        {!ihaleKapali ? "TEKLİF VERİLEBİLİR" : "KAPANDI"}
                                    </span>
                                    <h5 className="card-title">{ihale.baslik}</h5>
                                    {ihale.konum && <p className="card-text text-muted">{ihale.konum}</p>}

                                    <p> <strong>Başlangıç Bedeli:</strong>{" "}
                                        ₺{Number(ihale.baslangic_bedeli || 0).toLocaleString("tr-TR")}</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/ihale/${ihale.id}`)}
                                    >
                                        Detay
                                    </button>
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
                                            <p><strong>Yakıt:</strong> {ihale.ozellikler?.yakit_turu ?? "-"}</p>
                                            <p><strong>Renk:</strong> {ihale.ozellikler?.renk ?? "-"}</p>
                                        </>
                                    )}

                                    {ihale.kategori === "yapi" && (
                                        <>
                                            <p><strong>Metrekare:</strong> {ihale.ozellikler?.metrekare ?? "-"}</p>
                                            <p><strong>Oda Sayısı:</strong> {ihale.ozellikler?.oda_sayisi ?? "-"}</p>
                                            <p><strong>Bina Yaşı:</strong> {ihale.ozellikler?.bina_yasi ?? "-"}</p>
                                        </>
                                    )}

                                    {ihale.kategori === "hizmet" && (
                                        <>
                                            <p><strong>Kapsam:</strong> {ihale.ozellikler?.kapsam ?? "-"}</p>
                                            <p><strong>Süre:</strong> {ihale.ozellikler?.hizmet_suresi ?? "-"}</p>
                                        </>
                                    )}

                                    <div className="d-flex gap-2 mt-2">
                                        {teklifKart && (
                                            <button
                                                className="btn btn-danger"
                                                disabled={!teklifId || ihaleKapali}
                                                onClick={() => handleIptal(teklifId)}
                                            >
                                                İptal Et
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container mt-4">
            <div className="mb-4 d-flex gap-2 flex-wrap">
                <button onClick={() => setAktifTab("ihalelerim")}
                    className={`btn ${aktifTab === "ihalelerim" ? "btn-primary" : "btn-outline-primary"}`}>
                    İhalelerim
                </button>
                <button onClick={() => setAktifTab("teklifVerdiklerim")}
                    className={`btn ${aktifTab === "teklifVerdiklerim" ? "btn-secondary" : "btn-outline-secondary"}`}>
                    Teklif Verdiklerim
                </button>
                <button onClick={() => setAktifTab("kazandiklarim")}
                    className={`btn ${aktifTab === "kazandiklarim" ? "btn-success" : "btn-outline-success"}`}>
                    Kazandıklarım
                </button>
                <Link to="/ihale-olustur" className="btn btn-outline-warning">İhale Oluştur</Link>
                <button onClick={() => navigate("/profil")} className="btn btn-outline-dark">Profil</button>
            </div>

            {aktifTab === "ihalelerim" && renderIhaleKartlari(ihalelerim)}
            {aktifTab === "teklifVerdiklerim" && renderIhaleKartlari(teklifVerdiklerim, { teklifKart: true })}
            {aktifTab === "kazandiklarim" && renderIhaleKartlari(kazandiklarim)}
        </div>
    );
}

export default UserPanel;
