import React, { useState } from "react";

function Profil() {
    const [profil, setProfil] = useState({ isim: "", email: "", telefon: "" });
    const [parola, setParola] = useState({ eski_sifre: "", yeni_sifre: "" });
    const token = localStorage.getItem("token");

    const guncelleProfil = () => {
        fetch("http://localhost:5000/kullanici/profil", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profil),
        })
            .then((res) => res.json())
            .then((data) => alert(data.mesaj || data.hata));
    };

    const degistirParola = () => {
        fetch("http://localhost:5000/kullanici/parola", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(parola),
        })
            .then((res) => res.json())
            .then((data) => alert(data.mesaj || data.hata));
    };

    return (
        <div className="container mt-4">
            <h3>Profil Bilgileri</h3>
            <input type="text" className="form-control mb-2" placeholder="İsim"
                onChange={(e) => setProfil({ ...profil, isim: e.target.value })} />
            <input type="email" className="form-control mb-2" placeholder="Email"
                onChange={(e) => setProfil({ ...profil, email: e.target.value })} />
            <input type="text" className="form-control mb-2" placeholder="Telefon"
                onChange={(e) => setProfil({ ...profil, telefon: e.target.value })} />
            <button className="btn btn-success mb-4" onClick={guncelleProfil}>Güncelle</button>

            <h3>Parola Değiştir</h3>
            <input type="password" className="form-control mb-2" placeholder="Eski Şifre"
                onChange={(e) => setParola({ ...parola, eski_sifre: e.target.value })} />
            <input type="password" className="form-control mb-2" placeholder="Yeni Şifre"
                onChange={(e) => setParola({ ...parola, yeni_sifre: e.target.value })} />
            <button className="btn btn-warning" onClick={degistirParola}>Parolayı Değiştir</button>
        </div>
    );
}

export default Profil;
