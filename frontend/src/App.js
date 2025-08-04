import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./pages/UserPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import IhaleDetay from "./components/IhaleDetay";
import KazananTeklif from "./components/KazananTeklif";
import AdminIhaleDetay from "./components/AdminIhaleDetay";
import AdminKullaniciTeklifler from "./components/AdminKullaniciTeklifler";
import { useState } from "react";

function App() {
  const [aramaMetni, setAramaMetni] = useState("");

  return (
    <Router>
      <Navbar aramaMetni={aramaMetni} setAramaMetni={setAramaMetni} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/giris" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel aramaMetni={aramaMetni} setAramaMetni={setAramaMetni} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kullanici"
          element={
            <ProtectedRoute>
              <UserPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/ihale/:id" element={<IhaleDetay />} />
        <Route path="/admin/ihale/:ihale_id/kazanan" element={<KazananTeklif />} />
        <Route path="/admin/ihale/:id" element={<AdminIhaleDetay />} />
        <Route
          path="/admin/kullanici/:kullaniciId/teklifler"
          element={<AdminKullaniciTeklifler />}
        />
      </Routes>
    </Router>
  );
}

export default App;
