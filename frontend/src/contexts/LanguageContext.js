import React, { createContext, useContext, useEffect, useState } from "react";
import translations from "../locales/translations.json";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(null); // null until loaded

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    setLanguage(savedLang || "en");
  }, []);

  useEffect(() => {
    if (language) {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const t = (key) => translations[key]?.[language] || key;

  if (!language) return null; // or show a loader/spinner

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
