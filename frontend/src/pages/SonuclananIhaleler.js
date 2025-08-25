import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function GuncelIhaleler() {
    const navigate = useNavigate();
    const [ihaleler, setIhaleler] = useState([]);
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
            const res = await fetch(`http://localhost:5000/ihaleler/sonuc?${query}`);
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
        <div className="container mt-4" style={{ display: "flex" }}>


            <div
                style={{
                    flex: "0 0 320px",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    padding: "1.5rem",
                    alignSelf: "flex-start"
                }}
            >
                <h4 className="mb-4">🔍 Filtrele</h4>

                <div className="mb-3">
                    <label className="form-label">İhale Adı</label>
                    <input
                        type="text"
                        name="ad"
                        className="form-control form-control-lg"
                        placeholder="İhale adı giriniz"
                        value={filters.ad}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">İhale Numarası</label>
                    <input
                        type="text"
                        name="numara"
                        className="form-control form-control-lg"
                        placeholder="Numara"
                        value={filters.numara}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">İçerik</label>
                    <input
                        type="text"
                        name="icerik"
                        className="form-control form-control-lg"
                        placeholder="İçerik ara..."
                        value={filters.icerik}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Bulunduğu Yer</label>
                    <input
                        type="text"
                        name="yer"
                        className="form-control form-control-lg"
                        placeholder="Şehir / İlçe"
                        value={filters.yer}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">İhale Tipi</label>
                    <select
                        name="kategori"
                        className="form-select form-select-lg"
                        value={filters.kategori}
                        onChange={handleChange}
                    >
                        <option value="">Seçiniz</option>
                        <option value="arac">Araç</option>
                        <option value="yapi">Yapı</option>
                        <option value="hizmet">Hizmet</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Fiyat Aralığı</label>
                    <div className="d-flex" style={{ gap: "0.5rem" }}>
                        <input
                            type="number"
                            name="minFiyat"
                            className="form-control form-control-lg"
                            placeholder="Min"
                            value={filters.minFiyat}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="maxFiyat"
                            className="form-control form-control-lg"
                            placeholder="Max"
                            value={filters.maxFiyat}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="d-flex mt-4" style={{ gap: "0.5rem" }}>
                    <button className="btn btn-warning w-50 btn-lg" onClick={handleClear}>
                        Temizle
                    </button>
                    <button className="btn btn-primary w-50 btn-lg" onClick={handleSearch}>
                        Ara
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, marginLeft: "2rem" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-warning text-dark fs-6">
                        {ihaleler.length} ADET BULUNDU
                    </span>
                </div>
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
            </div>
        </div>
    );
}

export default GuncelIhaleler;
