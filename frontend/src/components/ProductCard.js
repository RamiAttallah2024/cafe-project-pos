import React from "react";
import "./ProductCard.css";
import { useLanguage } from "../contexts/LanguageContext";

function ProductCard({ product, onAddToTable }) {
  const { t } = useLanguage();

  if (!product) return null;

  const { name, price, type, image } = product;

  return (
    <div className="product-card">
      <img
        src={image}
        alt={name}
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = "/no-image.png";
        }}
      />
      <h4>{name}</h4>
      <p>
        {t("type")}: {t(type.toLowerCase())}
      </p>
      <p>
        {t("price")}: ${price}
      </p>
      {onAddToTable && (
        <button onClick={() => onAddToTable(product)}>
          {t("add_to_table")}
        </button>
      )}
    </div>
  );
}

export default ProductCard;
