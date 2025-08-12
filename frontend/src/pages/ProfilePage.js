import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function ProfilePage() {
    const token = localStorage.getItem("token");
    const [me, setMe] = useState(null);
    const [form, setForm] = useState({ isim: "", email: "", telefon: "" });
    const [pwd, setPwd] = useState({ eski_sifre: "", yeni_sifre: "" });
    const [alert, setAlert] = useState(null);

    const authFetch = async (path, options = {}) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.hata || data.message || `HTTP ${res.status}`);
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const m = await authFetch("/kullanici/me");
                setMe(m);
                setForm({ isim: m.isim || "", email: m.email || "", telefon: m.telefon || "" });
            } catch (e) {
                setAlert({ type: "danger", text: e.message });
            }
        })();
    }, []);

    const saveProfile = async (e) => {
        e.preventDefault();
        try {
            await authFetch("/kullanici/profil", { method: "PUT", body: JSON.stringify(form) });
            setAlert({ type: "success", text: "Profil güncellendi" });
            setMe((prev) => ({ ...(prev || {}), ...form }));
        } catch (e) {
            setAlert({ type: "danger", text: e.message });
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        try {
            await authFetch("/kullanici/parola", { method: "PUT", body: JSON.stringify(pwd) });
            setAlert({ type: "success", text: "Parola güncellendi" });
            setPwd({ eski_sifre: "", yeni_sifre: "" });
        } catch (e) {
            setAlert({ type: "danger", text: e.message });
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Profil</h2>
                <Link to="/kullanici" className="btn btn-outline-secondary">← Kullanıcı Paneli</Link>
            </div>

            {alert && <div className={`alert alert-${alert.type}`}>{alert.text}</div>}

            <div className="row g-3">
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Bilgilerim</h5>
                            {!me ? <div className="text-muted">Yükleniyor…</div> : (
                                <div className="small">
                                    <div><strong>İsim:</strong> {me.isim || "-"}</div>
                                    <div><strong>Email:</strong> {me.email || "-"}</div>
                                    <div><strong>Telefon:</strong> {me.telefon || "-"}</div>
                                    <div><strong>Rol:</strong> {me.rol || "-"}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Profil Düzenle</h5>
                            <form onSubmit={saveProfile}>
                                <div className="mb-2">
                                    <label className="form-label">İsim</label>
                                    <input className="form-control" value={form.isim}
                                        onChange={(e) => setForm({ ...form, isim: e.target.value })} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Telefon</label>
                                    <input className="form-control" value={form.telefon}
                                        onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
                                </div>
                                <button className="btn btn-primary" type="submit">Kaydet</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Parola Değiştir</h5>
                            <form onSubmit={changePassword} className="row g-2">
                                <div className="col-md-6">
                                    <label className="form-label">Eski Şifre</label>
                                    <input type="password" className="form-control" value={pwd.eski_sifre}
                                        onChange={(e) => setPwd({ ...pwd, eski_sifre: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Yeni Şifre</label>
                                    <input type="password" className="form-control" value={pwd.yeni_sifre}
                                        onChange={(e) => setPwd({ ...pwd, yeni_sifre: e.target.value })} />
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-dark mt-2" type="submit">Güncelle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
