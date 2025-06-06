import React, { useState, useEffect } from "react";
import "./Tables.css";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = "https://cafe-project-pos.onrender.com/api/tables";

export default function Tables({ selectedTableId, setSelectedTableId }) {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setTables(data);
      } catch (error) {
        console.error("Error loading tables:", error);
      }
    };

    fetchTables();
  }, []);

  const addTable = async () => {
    if (newTableName.trim() === "") return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTableName }),
      });

      if (!response.ok) throw new Error("Failed to create table");

      const newTable = await response.json();
      setTables([...tables, newTable]);
      setNewTableName("");
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert(t("create_table_failed"));
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm(t("confirm_delete_table"))) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete table");

      setTables(tables.filter((t) => t.id !== id));
      if (selectedTableId === id) setSelectedTableId(null);
    } catch (error) {
      console.error("Error deleting table:", error);
      alert(t("delete_table_failed"));
    }
  };

  const toggleSelect = (id) => {
    setSelectedTableId(selectedTableId === id ? null : id);
  };

  return (
    <div className="table-manager">
      <button className="add-button" onClick={() => setIsPopupOpen(true)}>
        {t("add_table")}
      </button>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>{t("create_new_table")}</h2>
            <input
              className="input"
              type="text"
              placeholder={t("enter_table_name")}
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
            />
            <div className="popup-buttons">
              <button
                className="cancel-button"
                onClick={() => setIsPopupOpen(false)}
              >
                {t("cancel")}
              </button>
              <button className="create-button" onClick={addTable}>
                {t("create")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => toggleSelect(table.id)}
            className={`table-card ${
              selectedTableId === table.id ? "selected" : ""
            }`}
          >
            <div>{table.name}</div>
            <button
              className="delete-button"
              onClick={() => handleDeleteTable(table.id)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
