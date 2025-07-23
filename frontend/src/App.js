import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./pages/UserPanel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/giris" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/kullanici" element={<UserPanel />} />
      </Routes>
    </Router>
  );
}

export default App;

