import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Fiis from "./pages/Fiis";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <nav className="menu-navegacao">
        <div className="menu-container">
          <Link to="/" className="link-menu">
            Orçamento Mensal
          </Link>
          <Link to="/fiis" className="link-menu">
            Projeção de FIIs
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/fiis" element={<Fiis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
