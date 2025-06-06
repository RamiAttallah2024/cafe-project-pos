import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import { useLanguage } from "../contexts/LanguageContext";

function ProductsPage() {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    type: "",
    image: null,
    imageFile: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://cafe-project-pos.onrender.com/api/products"
        );
        const data = await response.json();
        const updated = data.map((p) => ({
          ...p,
          image: `https://cafe-project-pos.onrender.com/${p.image}`,
        }));
        setProducts(updated);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: URL.createObjectURL(file), imageFile: file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.type || !form.imageFile) {
      alert(t("fill_all_fields"));
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("type", form.type);
    data.append("image", form.imageFile);

    try {
      const response = await fetch(
        "https://cafe-project-pos.onrender.com/api/products",
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const newProduct = await response.json();
      setProducts([
        ...products,
        {
          ...newProduct,
          image: `https://cafe-project-pos.onrender.com/${newProduct.image}`,
        },
      ]);

      setForm({ name: "", price: "", type: "", image: null, imageFile: null });
    } catch (error) {
      console.error("Error submitting product:", error);
      alert(t("add_failed"));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t("confirm_delete"))) return;

    try {
      const res = await fetch(
        `https://cafe-project-pos.onrender.com/api/products/${productId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || t("delete_failed"));
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(t("server_error"));
    }
  };

  const productTypes = ["Food", "Drink", "Dessert", "Snack"];

  return (
    <div className="products-page">
      <h2>{t("add_product")}</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="name"
          value={form.name}
          placeholder={t("product_name")}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          value={form.price}
          placeholder={t("price")}
          onChange={handleChange}
        />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">{t("select_type")}</option>
          {productTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {t(type.toLowerCase())}
            </option>
          ))}
        </select>
        <div className="image-upload">
          <label htmlFor="file-upload" className="upload-button">
            {t("select_image")}
          </label>
          <input
            id="file-upload"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="file-input"
          />
          {form.image && (
            <img src={form.image} alt="Preview" className="image-preview" />
          )}
          <button type="submit">{t("add_product")}</button>
        </div>
      </form>

      <div className="product-list">
        <h3>{t("products")}</h3>
        <div className="product-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <img src={product.image} alt={product.name} />
              <h4>{product.name}</h4>
              <p>
                {t("type")}: {t(product.type.toLowerCase())}
              </p>
              <p>
                {t("price")}: ${product.price}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDelete(product.id)}
              >
                ❌ {t("delete")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
