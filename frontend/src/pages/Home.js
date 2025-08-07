import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnaNavbar from "../components/AnaNavbar";
function Home() {
    const [ihaleler, setIhaleler] = useState([]);
    const navigate = useNavigate();
    const [gelismisGoster, setGelismisGoster] = useState(false);
    const [ihaleAdi, setIhaleAdi] = useState("");
    const [ihaleNumarasi, setIhaleNumarasi] = useState("");
    const [ihaleIcerigi, setIhaleIcerigi] = useState("");
    const [isletmeMudurlugu, setIsletmeMudurlugu] = useState("");
    const [bulunduguYer, setBulunduguYer] = useState("");
    const [ihaleDurumu, setIhaleDurumu] = useState("");
    const [minFiyat, setMinFiyat] = useState("");
    const [maxFiyat, setMaxFiyat] = useState("");
    const [sirala, setSirala] = useState("tarih");
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:5000/ihaleler", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then((data) => setIhaleler(data))
            .catch(err => console.error("İhaleler çekilemedi:", err));
    }, []);


    return (
        <>
            <AnaNavbar />
            <div style={kapsayiciKart}>

                <div style={inputGrup}>
                    <input
                        placeholder="İhale Adı" value={ihaleAdi}
                        onChange={(e) => setIhaleAdi(e.target.value)}
                        style={inputStyle}
                    />
                    <input placeholder="İhale Numarası" value={ihaleNumarasi} onChange={(e) => setIhaleNumarasi(e.target.value)} style={inputStyle} />
                    <input placeholder="İhale İçeriğinde Adı" value={ihaleIcerigi} onChange={(e) => setIhaleIcerigi(e.target.value)} style={inputStyle} />
                </div>
                {gelismisGoster && (
                    <div style={gelismisAlan}>
                        <input placeholder="İşletme Müdürlüğü" style={inputStyle} value={isletmeMudurlugu} onChange={(e) => setIsletmeMudurlugu(e.target.value)} />
                        <input placeholder="Bulunduğu Yer" style={inputStyle} value={bulunduguYer} onChange={(e) => setBulunduguYer(e.target.value)} />
                        <input placeholder="İhale Durumu" style={inputStyle} value={ihaleDurumu} onChange={(e) => setIhaleDurumu(e.target.value)} />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input placeholder="Min TL" value={minFiyat} onChange={(e) => setMinFiyat(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
                            <span>–</span>
                            <input placeholder="Max TL" value={maxFiyat} onChange={(e) => setMaxFiyat(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
                        </div>
                    </div>
                )}
                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                    <button style={temizleButon}>TEMİZLE</button>
                    <button
                        style={araButon}
                        onClick={() => setGelismisGoster(!gelismisGoster)}
                    >
                        {gelismisGoster ? "GİZLE" : "GELİŞMİŞ"}
                    </button>
                </div>


            </div>
            <div style={{
                background: "#ffc107",
                display: "inline-block",
                padding: "0.4rem 1rem",
                borderRadius: "20px",
                fontWeight: "bold",
                margin: "1rem"
            }}>
                {ihaleler.length} ADET BULUNDU
            </div>
            <select
                value={sirala}
                onChange={(e) => setSirala(e.target.value)}
                style={{
                    padding: "0.5rem",
                    borderRadius: "5px",
                    margin: "0 1rem 1rem 1rem"
                }}
            >    <option value="tarih">Tarih (En Erken Bitecek)</option>
                <option value="fiyatArtan">Fiyat (Artan)</option>
                <option value="fiyatAzalan">Fiyat (Azalan)</option>
            </select>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                padding: "1rem"
            }}>
                {ihaleler.map((ihale) => (
                    <div key={ihale.id} style={{
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease"
                    }}
                        onClick={() => navigate(`/ihale/${ihale.id}`)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.03)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                        }}>

                        <img src={ihale.resimURL} alt={ihale.baslik} style={{ width: "100%", height: "200px", objectFit: "cover" }} />

                        <div style={{ padding: "1rem" }}>
                            {ihale.aktif === 1 && (
                                <div style={{ background: "green", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", display: "inline-block", marginBottom: "0.5rem" }}>
                                    TEKLİF VERİLEBİLİR
                                </div>
                            )}
                            <h3>{ihale.baslik}</h3>
                            <p style={{ fontStyle: "italic" }}>{ihale.konum}</p>
                            <p><strong>Başlangıç Bedeli:</strong> ₺{ihale.baslangic_bedeli}</p>
                            <p>{ihale.teklifVarMi ? "Teklif Mevcut" : "Teklif Mevcut Değil"}</p>
                            <p>🗓 {new Date(ihale.bitis_tarihi).toLocaleString()}</p>
                            <p><strong>Yıl:</strong> {ihale.yil}</p>
                            <p><strong>Km:</strong> {ihale.km} km</p>
                            <p><strong>Vites:</strong> {ihale.vites}</p>

                            <button
                                onClick={() => navigate(`/ihale/${ihale.id}`)}
                                style={{
                                    marginTop: "1rem",
                                    background: "#15428b",
                                    color: "#fff",
                                    padding: "0.5rem 1rem",
                                    border: "none",
                                    borderRadius: "5px",
                                    float: "right",
                                    cursor: "pointer"
                                }}
                            >
                                DETAY
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
const kapsayiciKart = {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    margin: "2rem auto",
    maxWidth: "90%"

};

const inputGrup = {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap"
};

const gelismisAlan = {
    marginTop: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem"
};
const inputStyle = {
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px"
};

const temizleButon = {
    background: "#ffc107",
    border: "none",
    padding: "0.7rem 2rem",
    borderRadius: "5px",
    fontWeight: "bold",
    color: "#000",
    cursor: "pointer"
};

const araButon = {
    background: "#15428b",
    border: "none",
    padding: "0.7rem 2rem",
    borderRadius: "5px",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer"
};
export default Home;
