import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
function IhaleOlustur() {
    const [kategoriler, setKategoriler] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [form, setForm] = useState({
        baslik: "",
        aciklama: "",
        baslangic_tarihi: "",
        bitis_tarihi: "",
        baslangic_bedeli: "",
        kategori_id: "",
        yil: "",
        vites: "",
        km: "",
        yakit_turu: "",
        renk: "",
        metrekare: "",
        oda_sayisi: "",
        bina_yasi: "",
        hizmet_turu: "",
        sure_gun: ""
    });
    const [resimler, setResimler] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/kategoriler")
            .then((res) => res.json())
            .then((data) => setKategoriler(data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("baslik", form.baslik);
        formData.append("aciklama", form.aciklama);
        formData.append("kategori_id", form.kategori_id);
        formData.append("baslangic_tarihi", form.baslangic_tarihi);
        formData.append("bitis_tarihi", form.bitis_tarihi);

        resimler.forEach((file) => {
            formData.append("resimler", file);
        });
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }
        try {
            const res = await fetch("http://localhost:5000/ihale", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setShowToast(true);
            } else {
                alert(data.hata || "Bir hata oluştu");
            }
        } catch (err) {
            console.error("Hata:", err);
        }
    };

    return (
        <div className="container mt-4">
            <h3>İhale Oluştur</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Başlık"
                    onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                />

                <textarea
                    className="form-control mb-2"
                    placeholder="Açıklama"
                    onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                ></textarea>

                <select
                    className="form-control mb-2"
                    onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
                >
                    <option value="">Kategori Seç</option>
                    {kategoriler.map((kat) => (
                        <option key={kat.kod} value={kat.kod}>
                            {kat.ad}
                        </option>
                    ))}
                </select>

                {form.kategori_id === "arac" && (
                    <>
                        <input className="form-control mb-2" placeholder="Yıl" onChange={(e) => setForm({ ...form, yil: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Vites" onChange={(e) => setForm({ ...form, vites: e.target.value })} />
                        <input className="form-control mb-2" placeholder="KM" onChange={(e) => setForm({ ...form, km: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Yakıt Türü" onChange={(e) => setForm({ ...form, yakit_turu: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Renk" onChange={(e) => setForm({ ...form, renk: e.target.value })} />
                    </>
                )}

                {form.kategori_id === "yapi" && (
                    <>
                        <input className="form-control mb-2" placeholder="Metrekare" onChange={(e) => setForm({ ...form, metrekare: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Oda Sayısı" onChange={(e) => setForm({ ...form, oda_sayisi: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Bina Yaşı" onChange={(e) => setForm({ ...form, bina_yasi: e.target.value })} />
                    </>
                )}

                {form.kategori_id === "hizmet" && (
                    <>
                        <input className="form-control mb-2" placeholder="Hizmet Türü" onChange={(e) => setForm({ ...form, hizmet_turu: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Süre (gün)" onChange={(e) => setForm({ ...form, sure_gun: e.target.value })} />
                    </>
                )}

                <input
                    type="datetime-local"
                    className="form-control mb-2"
                    onChange={(e) => setForm({ ...form, baslangic_tarihi: e.target.value })}
                />
                <input
                    type="datetime-local"
                    className="form-control mb-2"
                    onChange={(e) => setForm({ ...form, bitis_tarihi: e.target.value })}
                />

                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Başlangıç Bedeli"
                    onChange={(e) => setForm({ ...form, baslangic_bedeli: e.target.value })}
                />

                <input
                    type="file"
                    multiple
                    name="resimler"
                    className="form-control mb-2"
                    onChange={(e) => setResimler(Array.from(e.target.files))}
                />

                <button className="btn btn-primary">Oluştur</button>
            </form>
            <ToastContainer position="top-center" className="mt-3">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    bg="success"
                >
                    <Toast.Body className="text-white">
                        İhale başarıyla oluşturuldu
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div >
    );
}
export default IhaleOlustur;
