import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./pages/UserPanel";
import IhaleOlustur from "./pages/IhaleOlustur";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import IhaleDetay from "./components/IhaleDetay";
import KazananTeklif from "./components/KazananTeklif";
import AdminIhaleDetay from "./components/AdminIhaleDetay";
import AdminKullaniciTeklifler from "./components/AdminKullaniciTeklifler";
import { useState } from "react";
import Arsiv from "./pages/Arsiv";
import 'bootstrap/dist/css/bootstrap.min.css';
function AppContent() {
  const [aramaMetni, setAramaMetni] = useState("");
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {!isHome && <Navbar aramaMetni={aramaMetni} setAramaMetni={setAramaMetni} />}

      <Routes>
        <Route path="/" element={
          <Home />
        } />
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


        <Route
          path="/arsiv"
          element={
            <ProtectedRoute>
              <Arsiv />
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
        <Route path="/kullanici" element={<UserPanel />} />
        <Route path="/ihale-olustur" element={<IhaleOlustur />} />
      </Routes>
    </>
  );
}
function App() {
  return (
    <Router>
      <AppContent />
    </Router>

  )
}

export default App;
