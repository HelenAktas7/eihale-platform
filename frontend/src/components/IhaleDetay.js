import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function IhaleDetay() {
    const { id } = useParams();
    const [ihale, setIhale] = useState(null);
    const [kullaniciId, setKullaniciId] = useState(null);
    const [teklifTutari, setTeklifTutari] = useState("");
    const [teklifler, setTeklifler] = useState([]);


    const para = (n) =>
        typeof n === "number"
            ? n.toLocaleString("tr-TR")
            : n
                ? Number(n).toLocaleString("tr-TR")
                : "0";


    const tarih = (iso) =>
        iso ? new Date(iso).toLocaleString("tr-TR") : "-";


    const fetchTeklifler = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/ihale/${id}/teklifler`);
            const data = await res.json();
            const sirali = (data || []).sort(
                (a, b) => Number(b.miktar) - Number(a.miktar)
            );
            setTeklifler(sirali);
        } catch (err) {
            console.error("Teklifler yüklenemedi", err);
        }
    }, [id]);

    useEffect(() => {
        fetchTeklifler();
    }, [fetchTeklifler]);


    useEffect(() => {
        fetch(`http://localhost:5000/ihale/${id}`)
            .then((res) => res.json())
            .then((data) => setIhale(data))
            .catch((error) => console.error("İhale alınamadı:", error));
    }, [id]);


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


    const handleTeklifGonder = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const decoded = jwtDecode(token);

            const response = await fetch("http://localhost:5000/teklif", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ihale_id: id,
                    kullanici_id: decoded.id,
                    tutar: parseFloat(teklifTutari),
                    teklif_tarihi: new Date().toISOString(),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Teklif başarıyla gönderildi!");
                setTeklifTutari("");
                fetchTeklifler();
            } else {
                alert("Hata: " + (data.error || data.message));
            }
        } catch (error) {
            console.error("Teklif gönderme hatası:", error);
            alert("Sunucu hatası oluştu.");
        }
    };

    const ihaleId = ihale?.id || ihale?.ihale_id;

    return (
        <div className="container py-4">
            {ihale ? (
                <>

                    <div className="card shadow-sm mb-4">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="card-title mb-2 fw-bold">{ihale.baslik}</h5>
                                <p className="card-subtitle text-muted mb-0">
                                    <i className="bi bi-geo-alt-fill me-2" />
                                    {ihale.konum || "Konum bilgisi yok"}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted">İhale No: </span>
                                <span className="fw-bold text-primary">{ihaleId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="row">

                        <div className="col-md-8">

                            {ihale.resimler && ihale.resimler.length > 0 ? (
                                <div id="ihaleCarousel" className="carousel slide mb-3" data-bs-ride="carousel">

                                    <div className="carousel-indicators">
                                        {ihale.resimler.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                data-bs-target="#ihaleCarousel"
                                                data-bs-slide-to={index}
                                                className={index === 0 ? "active" : ""}
                                                aria-current={index === 0 ? "true" : "false"}
                                                aria-label={`Slide ${index + 1}`}
                                            ></button>
                                        ))}
                                    </div>

                                    <div className="carousel-inner">
                                        {ihale.resimler.map((resim, index) => (
                                            <div
                                                className={`carousel-item ${index === 0 ? "active" : ""}`}
                                                key={index}
                                            >
                                                <img
                                                    src={`http://localhost:5000/uploads/${resim}`}
                                                    className="d-block w-100 rounded"
                                                    style={{ maxHeight: 420, objectFit: "cover" }}
                                                    alt={`ihale-resim-${index}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="carousel-control-prev"
                                        type="button"
                                        data-bs-target="#ihaleCarousel"
                                        data-bs-slide="prev"
                                    >
                                        <span className="carousel-control-prev-icon" aria-hidden="true" />
                                        <span className="visually-hidden">Önceki</span>
                                    </button>
                                    <button
                                        className="carousel-control-next"
                                        type="button"
                                        data-bs-target="#ihaleCarousel"
                                        data-bs-slide="next"
                                    >
                                        <span className="carousel-control-next-icon" aria-hidden="true" />
                                        <span className="visually-hidden">Sonraki</span>
                                    </button>
                                </div>
                            ) : (
                                <img
                                    src="/placeholder.jpg"
                                    alt={ihale.baslik}
                                    className="img-fluid rounded mb-3"
                                />
                            )}

                            <div className="card p-3 mb-4">
                                <h5>İhale Özellikleri</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <strong>Başlangıç Bedeli:</strong> ₺{para(ihale.baslangic_bedeli)}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Başlangıç Tarihi:</strong> {tarih(ihale.baslangic_tarihi)}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Bitiş Tarihi:</strong> {tarih(ihale.bitis_tarihi)}
                                    </li>

                                    {ihale.kategori === "arac" && (
                                        <>
                                            <li className="list-group-item"><strong>Yıl:</strong> {ihale.ozellikler?.yil ?? "-"}</li>
                                            <li className="list-group-item"><strong>Km:</strong> {ihale.ozellikler?.km ?? "-"}</li>
                                            <li className="list-group-item"><strong>Vites:</strong> {ihale.ozellikler?.vites ?? "-"}</li>
                                            {ihale.ozellikler?.yakit_turu && <li className="list-group-item"><strong>Yakıt Türü:</strong> {ihale.ozellikler?.yakit_turu}</li>}
                                            {ihale.ozellikler?.renk && <li className="list-group-item"><strong>Renk:</strong> {ihale.ozellikler?.renk}</li>}
                                        </>
                                    )}

                                    {ihale.kategori === "yapi" && (
                                        <>
                                            <li className="list-group-item"><strong>Metrekare:</strong> {ihale.ozellikler?.metrekare ?? "-"}</li>
                                            <li className="list-group-item"><strong>Oda Sayısı:</strong> {ihale.ozellikler?.oda_sayisi ?? "-"}</li>
                                            {ihale.ozellikler?.bina_yasi && <li className="list-group-item"><strong>Bina Yaşı:</strong> {ihale.ozellikler?.bina_yasi}</li>}
                                        </>
                                    )}

                                    {ihale.kategori === "hizmet" && (
                                        <>
                                            {ihale.ozellikler?.kapsam && <li className="list-group-item"><strong>Kapsam:</strong> {ihale.ozellikler?.kapsam}</li>}
                                            {ihale.ozellikler?.hizmet_suresi && <li className="list-group-item"><strong>Hizmet Süresi:</strong> {ihale.ozellikler?.hizmet_suresi}</li>}
                                        </>
                                    )}
                                </ul>
                            </div>

                            {ihale ? (
                                ihale.olusturan_id === kullaniciId ? (
                                    <p className="text-danger">
                                        Bu ihaleyi sen oluşturdun, teklif veremezsin!
                                    </p>
                                ) : (
                                    (String(ihale.aktif) === "1" || ihale.aktif === 1 || ihale.aktif === true) &&
                                        new Date(ihale.bitis_tarihi) > new Date() ? (
                                        <div className="card p-3 mb-4">
                                            <h5>Yeni Teklif Ver</h5>
                                            <form onSubmit={handleTeklifGonder} className="d-flex gap-2">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Teklif Tutarı (₺)"
                                                    value={teklifTutari}
                                                    onChange={(e) => setTeklifTutari(e.target.value)}
                                                    required
                                                />
                                                <button type="submit" className="btn btn-primary">
                                                    Teklif Ver
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <p className="text-danger fw-bold">
                                            Bu ihaleye artık teklif verilemez. (Kapanmış)
                                        </p>
                                    )
                                )
                            ) : null}


                        </div>


                        <div className="col-md-4">
                            <div className="card p-3">
                                <h5 className="text-center">TEKLİF DURUMU</h5>
                                <h4 className="text-center text-primary mb-3">
                                    Güncel Fiyat: ₺
                                    {teklifler.length > 0 ? para(teklifler[0].miktar) : "0"}
                                </h4>
                                <ul className="list-group mb-3">
                                    {teklifler.map((t, i) => (
                                        <li
                                            className="list-group-item d-flex justify-content-between"
                                            key={i}
                                        >
                                            <span>{t.kullanici_id.slice(0, 8).toUpperCase()}</span>
                                            <span>₺{para(t.miktar)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-dark text-white text-center py-2 rounded">
                                    <strong>0</strong> Saat <strong>0</strong> Dakika{" "}
                                    <strong>0</strong> Saniye
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p>İhale verisi yükleniyor...</p>
            )}
        </div>
    );
}

export default IhaleDetay;