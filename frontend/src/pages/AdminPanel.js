import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
function AdminPanel() {
    const [ihaleler, setIhaleler] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:5000/ihaleler", {
            headers: {
                "Authorization": 'Bearer ${token}',
            }
        })
            .then(res => res.json())
            .then(data => setIhaleler(data))
            .catch(err => console.error("Hata:", err));
    }, []);

    return (
        <div>
            <h2>Admin Paneli</h2>
            <p>Sadece ihaleler yetkisi olan kullanıcı bu sayfayı görebilir</p>

            <h3>İhaleler</h3>
            <ul>
                {ihaleler.map((ihale) => (
                    <li key={ihale.id}>
                        {ihale.baslik} - {ihale.aciklama}
                        <Link to={`/admin/ihale/${ihale.id}/kazanan`}>
                            <button style={{ marginLeft: "10px" }}>Kazananı Göster</button>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default AdminPanel;