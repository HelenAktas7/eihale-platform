import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

function IhaleOlustur() {
    const [kategoriler, setKategoriler] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [form, setForm] = useState({
        baslik: "",
        aciklama: "",
        konum: "",              // ✅ eksikti, eklendi
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

    // ✅ Eksik olan handleChange fonksiyonu eklendi
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append("baslik", form.baslik);
        formData.append("aciklama", form.aciklama);
        formData.append("konum", form.konum);   // ✅ burada büyük harfle "Konum" yazmışsın, küçük harf yaptım ki backend ile uyuşsun
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
                    konum: "",   // ✅ resetlendi
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
                    name="baslik"
                    value={form.baslik}
                    onChange={handleChange}
                />

                <textarea
                    className="form-control mb-2"
                    placeholder="Açıklama"
                    name="aciklama"
                    value={form.aciklama}
                    onChange={handleChange}
                ></textarea>

                <input
                    type="text"
                    name="konum"
                    className="form-control mb-2"
                    value={form.konum}
                    onChange={handleChange}
                    placeholder="Konum giriniz"
                />

                <select
                    className="form-control mb-2"
                    name="kategori_id"
                    value={form.kategori_id}
                    onChange={handleChange}
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
                        <input className="form-control mb-2" placeholder="Yıl" name="yil" value={form.yil} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="Vites" name="vites" value={form.vites} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="KM" name="km" value={form.km} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="Yakıt Türü" name="yakit_turu" value={form.yakit_turu} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="Renk" name="renk" value={form.renk} onChange={handleChange} />
                    </>
                )}

                {form.kategori_id === "yapi" && (
                    <>
                        <input className="form-control mb-2" placeholder="Metrekare" name="metrekare" value={form.metrekare} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="Oda Sayısı" name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="Bina Yaşı" name="bina_yasi" value={form.bina_yasi} onChange={handleChange} />
                    </>
                )}

                {form.kategori_id === "hizmet" && (
                    <>
                        <input className="form-control mb-2" placeholder="Kapsam" name="kapsam" value={form.kapsam} onChange={handleChange} />
                        <input className="form-control mb-2" placeholder="Hizmet Süresi" name="hizmet_suresi" value={form.hizmet_suresi} onChange={handleChange} />
                    </>
                )}

                <input
                    type="datetime-local"
                    className="form-control mb-2"
                    name="baslangic_tarihi"
                    value={form.baslangic_tarihi}
                    onChange={handleChange}
                />
                <input
                    type="datetime-local"
                    className="form-control mb-2"
                    name="bitis_tarihi"
                    value={form.bitis_tarihi}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Başlangıç Bedeli"
                    name="baslangic_bedeli"
                    value={form.baslangic_bedeli}
                    onChange={handleChange}
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
