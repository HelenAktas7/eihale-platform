import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function AdminIhaleDetay() {
    const { id } = useParams();
    const [teklifler, setTeklifler] = useState([]);
    const [kazanan, setKazanan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [guncelleData, setGuncelleData] = useState({
        baslik: "",
        aciklama: "",
        baslangic_tarihi: "",
        bitis_tarihi: ""
    });


    const fetchIhaleDetay = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:5000/admin/ihale/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.kazanan_teklif) {
                setKazanan(data.kazanan_teklif);
            } else {
                setKazanan(null);
            }

            if (data.ihale) {
                setGuncelleData({
                    baslik: data.ihale.baslik || "",
                    aciklama: data.ihale.aciklama || "",
                    baslangic_tarihi: data.ihale.baslangic_tarihi?.slice(0, 10) || "",
                    bitis_tarihi: data.ihale.bitis_tarihi?.slice(0, 10) || ""
                });
            }
        } catch (error) {
            console.error("Kazanan teklif fetch hatası:", error);
            setKazanan(null);
        }
    };


    useEffect(() => {
        fetchIhaleDetay();

        const token = localStorage.getItem("token");
        fetch(`http://localhost:5000/ihale/${id}/teklifler`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setTeklifler(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Teklifler fetch hatası:", err);
                setTeklifler([]);
            });
    }, [id]);

    const kazananYap = async (teklif_id) => {
        const confirm = window.confirm("Bu teklifi kazanan olarak belirlemek istiyor musunuz?");
        if (!confirm) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/admin/ihale/${id}/kazanan`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ teklif_id }),
            });

            const data = await res.json();
            alert(data.mesaj || data.hata);

            if (res.ok) {
                fetchIhaleDetay();
            }
        } catch (error) {
            console.error("Kazanan yap hatası:", error);
        }
    };
    const handleGuncelle = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:5000/admin/ihale/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(guncelleData)
            });

            const data = await res.json();
            alert(data.mesaj || data.hata);

            if (res.ok) {
                setShowModal(false);
                fetchIhaleDetay();
            }
        } catch (error) {
            console.error("Güncelleme hatası:", error);
        }
    };




    const katilimciSayisi = new Set(teklifler.map(t => t.kullanici_id)).size;
    const enYuksekTeklif = teklifler.reduce((max, t) => t.teklif_miktari > max ? t.teklif_miktari : max, 0);

    const formatTarih = (tarihStr) => {
        if (!tarihStr) return "Tarih yok";
        const date = new Date(tarihStr);
        return isNaN(date.getTime()) ? "Geçersiz Tarih" :
            date.toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">İhale Detayı (Admin Panel)</h3>
            <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                İhaleyi Güncelle
            </button>
            <div className="mb-3">
                <h5>Kazanan Teklif:</h5>
                {kazanan && kazanan.kullanici_id ? (
                    <div className="alert alert-success">
                        Kullanıcı: {kazanan.kullanici_id} |
                        Miktar: {kazanan.teklif_miktari} ₺ |
                        Tarih: {formatTarih(kazanan.teklif_tarihi)}
                    </div>
                ) : (
                    <div className="alert alert-warning">Henüz kazanan teklif bulunamadı</div>
                )}
            </div>

            <div className="mb-3">
                <h5>Katılım Sayısı: {katilimciSayisi}</h5>
                <h6>En Yüksek Teklif: {enYuksekTeklif} ₺</h6>
            </div>

            <div>
                <h5>Tüm Teklifler:</h5>
                {teklifler.length > 0 ? (
                    <ul className="list-group">
                        {Array.isArray(teklifler) && teklifler.map((t) => (
                            <li key={t.id} className="list-group-item d-flex justify-content-between">
                                <span>Kullanıcı: {t.kullanici_id}</span>
                                <span>{t.teklif_miktari} ₺</span>
                                <span>{t.teklif_tarihi
                                    ? new Date(t.teklif_tarihi).toLocaleString("tr-TR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })
                                    : "Tarih yok"}</span>
                                <button className="btn btn-success btn-sm" onClick={() => kazananYap(t.id)}>
                                    Kazanan Yap
                                </button>

                            </li>
                        ))}

                    </ul>
                ) : (
                    <p>Henüz teklif yapılmamış.</p>
                )}
            </div>
            {showModal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">İhaleyi Güncelle</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input type="text" className="form-control mb-2" placeholder="Başlık"
                                    value={guncelleData.baslik}
                                    onChange={(e) => setGuncelleData({ ...guncelleData, baslik: e.target.value })}
                                />
                                <textarea className="form-control mb-2" placeholder="Açıklama"
                                    value={guncelleData.aciklama}
                                    onChange={(e) => setGuncelleData({ ...guncelleData, aciklama: e.target.value })}
                                />
                                <input type="date" className="form-control mb-2"
                                    value={guncelleData.baslangic_tarihi}
                                    onChange={(e) => setGuncelleData({ ...guncelleData, baslangic_tarihi: e.target.value })}
                                />
                                <input type="date" className="form-control mb-2"
                                    value={guncelleData.bitis_tarihi}
                                    onChange={(e) => setGuncelleData({ ...guncelleData, bitis_tarihi: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button className="btn btn-success" onClick={handleGuncelle}>Kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminIhaleDetay;
