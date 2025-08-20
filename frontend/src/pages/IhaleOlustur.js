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
        kapsam: "",
        hizmet_suresi: ""
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
        formData.append("baslangic_bedeli", form.baslangic_bedeli);

        if (form.kategori_id === "arac") {
            formData.append("yil", form.yil);
            formData.append("km", form.km);
            formData.append("vites", form.vites);
            formData.append("yakit_turu", form.yakit_turu);
            formData.append("renk", form.renk);
        }

        if (form.kategori_id === "yapi") {
            formData.append("metrekare", form.metrekare);
            formData.append("oda_sayisi", form.oda_sayisi);
            formData.append("bina_yasi", form.bina_yasi);
        }

        if (form.kategori_id === "hizmet") {
            formData.append("kapsam", form.kapsam);
            formData.append("hizmet_suresi", form.hizmet_suresi);
        }

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
                setForm({
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
                    kapsam: "",
                    hizmet_suresi: ""
                });
                setResimler([]);
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
                    value={form.baslik}
                    onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                />

                <textarea
                    className="form-control mb-2"
                    placeholder="Açıklama"
                    value={form.aciklama}
                    onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                ></textarea>

                <select
                    className="form-control mb-2"
                    value={form.kategori_id}
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
                        <input className="form-control mb-2" placeholder="Yıl" value={form.yil} onChange={(e) => setForm({ ...form, yil: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Vites" value={form.vites} onChange={(e) => setForm({ ...form, vites: e.target.value })} />
                        <input className="form-control mb-2" placeholder="KM" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Yakıt Türü" value={form.yakit_turu} onChange={(e) => setForm({ ...form, yakit_turu: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Renk" value={form.renk} onChange={(e) => setForm({ ...form, renk: e.target.value })} />
                    </>
                )}

                {form.kategori_id === "yapi" && (
                    <>
                        <input className="form-control mb-2" placeholder="Metrekare" value={form.metrekare} onChange={(e) => setForm({ ...form, metrekare: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Oda Sayısı" value={form.oda_sayisi} onChange={(e) => setForm({ ...form, oda_sayisi: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Bina Yaşı" value={form.bina_yasi} onChange={(e) => setForm({ ...form, bina_yasi: e.target.value })} />
                    </>
                )}

                {form.kategori_id === "hizmet" && (
                    <>
                        <input className="form-control mb-2" placeholder="Kapsam" value={form.kapsam} onChange={(e) => setForm({ ...form, kapsam: e.target.value })} />
                        <input className="form-control mb-2" placeholder="Hizmet Süresi" value={form.hizmet_suresi} onChange={(e) => setForm({ ...form, hizmet_suresi: e.target.value })} />
                    </>
                )}

                <input
                    type="datetime-local"
                    className="form-control mb-2"
                    value={form.baslangic_tarihi}
                    onChange={(e) => setForm({ ...form, baslangic_tarihi: e.target.value })}
                />
                <input
                    type="datetime-local"
                    className="form-control mb-2"
                    value={form.bitis_tarihi}
                    onChange={(e) => setForm({ ...form, bitis_tarihi: e.target.value })}
                />

                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Başlangıç Bedeli"
                    value={form.baslangic_bedeli}
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
        </div>
    );
}

export default IhaleOlustur;
