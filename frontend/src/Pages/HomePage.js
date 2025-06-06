// HomePage.js
import React, { useState, useEffect } from "react";
import Tables from "../components/Tables";
import ProductCard from "../components/ProductCard";
import TableDetails from "../components/TableDetails";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [tableProducts, setTableProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      const updated = data.map((p) => ({
        ...p,
        image: `http://localhost:5000/${p.image}`,
      }));
      setProducts(updated);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await fetch(
        `http://localhost:5000/api/tables/${selectedTableId}/products/${productId}`,
        {
          method: "DELETE",
        }
      );
      fetchTableProducts(selectedTableId); // Refresh after deletion
      // Then refresh the product list
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  const fetchTableProducts = async (tableId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tables/${tableId}/products`
      );
      const data = await response.json();
      setTableProducts(data);
    } catch (error) {
      console.error("Failed to fetch table data:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedTableId) {
      fetchTableProducts(selectedTableId);
    }
  }, [selectedTableId]);

  const handleAddToTable = async (product) => {
    if (!selectedTableId) {
      alert("Please select a table first.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tables/${selectedTableId}/add-product`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        }
      );

      if (!response.ok) throw new Error("Failed to add product to table");

      // ✅ Re-fetch table products immediately after adding
      fetchTableProducts(selectedTableId);
    } catch (error) {
      console.error("Error adding product to table:", error);
      alert("Failed to add product to table.");
    }
  };

  return (
    <div className="btn-prd">
      <Tables
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
      />
      <div className="product-grid-home">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            onAddToTable={handleAddToTable}
          />
        ))}
      </div>
      <TableDetails
        tableId={selectedTableId}
        products={tableProducts}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}

export default HomePage;
