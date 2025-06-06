import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { useLanguage } from "../contexts/LanguageContext";

function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">
          <Link to="/">{t("appName")}</Link>
        </h1>
        <nav className="nav-links">
          <Link to="/products">{t("products")}</Link>
          <button
            className="lang-btn"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            {language === "en" ? "AR" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
