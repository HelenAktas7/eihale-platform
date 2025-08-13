import React, { useState, useEffect } from "react";

function IhaleOlustur() {
    const [kategoriler, setKategoriler] = useState([]);
    const [form, setForm] = useState({
        baslik: "",
        aciklama: "",
        kategori_id: "",
        baslangic_tarihi: "",
        bitis_tarihi: "",
        baslangic_bedeli: "",
    });
    const [resimler, setResimler] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("http://localhost:5000/kategoriler")
            .then((res) => res.json())
            .then((data) => setKategoriler(data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        for (const key in form) {
            formData.append(key, form[key]);
        }
        resimler.forEach((file) => formData.append("resimler", file));

        fetch("http://localhost:5000/ihale", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => alert(data.mesaj));
    };

    return (
        <div className="container mt-4">
            <h3>İhale Oluştur</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" className="form-control mb-2" placeholder="Başlık"
                    onChange={(e) => setForm({ ...form, baslik: e.target.value })} />

                <textarea className="form-control mb-2" placeholder="Açıklama"
                    onChange={(e) => setForm({ ...form, aciklama: e.target.value })}></textarea>

                <select className="form-control mb-2"
                    onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}>
                    <option value="">Kategori Seç</option>
                    {kategoriler.map((kat) => (
                        <option key={kat.id} value={kat.id}>{kat.ad}</option>
                    ))}
                </select>

                <input type="datetime-local" className="form-control mb-2"
                    onChange={(e) => setForm({ ...form, baslangic_tarihi: e.target.value })} />
                <input type="datetime-local" className="form-control mb-2"
                    onChange={(e) => setForm({ ...form, bitis_tarihi: e.target.value })} />

                <input type="number" className="form-control mb-2" placeholder="Başlangıç Bedeli"
                    onChange={(e) => setForm({ ...form, baslangic_bedeli: e.target.value })} />

                <input type="file" multiple className="form-control mb-2"
                    onChange={(e) => setResimler([...e.target.files])} />

                <button className="btn btn-primary">Oluştur</button>
            </form>
        </div>
    );
}

export default IhaleOlustur;
