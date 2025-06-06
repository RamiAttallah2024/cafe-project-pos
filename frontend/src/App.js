import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProductsPage from "./Pages/ProductsPage";
import HomePage from "./Pages/HomePage";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import "./App.css";

function AppContent() {
  const { language } = useLanguage();

  // Dynamically set direction and language
  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <div dir={direction} lang={language}>
      <Router>
        <Header />
        <main style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
