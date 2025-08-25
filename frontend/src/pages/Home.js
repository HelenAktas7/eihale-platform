import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnaNavbar from "../components/AnaNavbar";

function Home() {
    const [ihaleler, setIhaleler] = useState([]);
    const navigate = useNavigate();
    const [gelismisGoster, setGelismisGoster] = useState(false);
    const [sirala, setSirala] = useState("tarih");
    const [filters, setFilters] = useState({
        ad: "",
        numara: "",
        icerik: "",
        yer: "",
        minFiyat: "",
        maxFiyat: "",
        kategori: ""
    });

    const fetchIhaleler = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`http://localhost:5000/ihaleler?${query}`);
            const data = await res.json();
            setIhaleler(data);
        } catch (err) {
            console.error("Fetch hatası:", err);
        }
    };

    useEffect(() => {
        fetchIhaleler();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        fetchIhaleler();
    };

    const handleClear = () => {
        setFilters({
            ad: "",
            numara: "",
            icerik: "",
            yer: "",
            minFiyat: "",
            maxFiyat: "",
            kategori: ""
        });
        fetchIhaleler();
    };

    return (
        <>
            <AnaNavbar />
            <div style={kapsayiciKart}>
                <div style={inputGrup}>
                    <input
                        name="ad"
                        placeholder="İhale Adı"
                        value={filters.ad}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                    <input
                        name="numara"
                        placeholder="İhale Numarası"
                        value={filters.numara}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                    <input
                        name="icerik"
                        placeholder="İhale İçeriğinde Adı"
                        value={filters.icerik}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>
                {gelismisGoster && (
                    <div style={gelismisAlan}>
                        <input
                            name="yer"
                            placeholder="Bulunduğu Yer"
                            style={inputStyle}
                            value={filters.yer}
                            onChange={handleChange}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input
                                name="minFiyat"
                                placeholder="Min TL"
                                value={filters.minFiyat}
                                onChange={handleChange}
                                style={{ ...inputStyle, width: "100px" }}
                            />
                            <span>–</span>
                            <input
                                name="maxFiyat"
                                placeholder="Max TL"
                                value={filters.maxFiyat}
                                onChange={handleChange}
                                style={{ ...inputStyle, width: "100px" }}
                            />
                        </div>
                    </div>
                )}
                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                    <button style={temizleButon} onClick={handleClear}>TEMİZLE</button>
                    <button style={araButon} onClick={handleSearch}>ARA</button>
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
            >
                <option value="tarih">Tarih (En Erken Bitecek)</option>
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

                        <img
                            src={
                                ihale.resimler && ihale.resimler.length > 0
                                    ? `http://localhost:5000/uploads/${ihale.resimler[0]}`
                                    : "https://via.placeholder.com/400x200?text=Görsel+Yok"
                            }
                            alt={ihale.baslik}
                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                        />

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

                            {ihale.kategori_kod === "arac" && (
                                <>
                                    <p><strong>Yıl:</strong> {ihale.yil}</p>
                                    <p><strong>Km:</strong> {ihale.km}</p>
                                    <p><strong>Vites:</strong> {ihale.vites}</p>
                                </>
                            )}

                            {ihale.kategori_kod === "yapi" && (
                                <>
                                    <p><strong>Metrekare:</strong> {ihale.metrekare}</p>
                                    <p><strong>Oda Sayısı:</strong> {ihale.oda_sayisi}</p>
                                    <p><strong>Bina Yaşı:</strong> {ihale.bina_yasi}</p>
                                </>
                            )}

                            {ihale.kategori_kod === "hizmet" && (
                                <>
                                    <p><strong>Hizmet Türü:</strong> {ihale.hizmet_turu}</p>
                                    <p><strong>Süre (gün):</strong> {ihale.sure_gun}</p>
                                </>
                            )}

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
