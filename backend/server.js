// Import required modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const productsRoutes = require("./routes/products");
const tablesRoutes = require("./routes/tables");
const { Pool } = require("pg");

// PostgreSQL database connection pool
const db = new Pool({
  user: "neondb_owner",
  host: "ep-floral-shadow-a8swo5ch-pooler.eastus2.azure.neon.tech",
  database: "neondb",
  password: "npg_OeuhA3pw5QCN",
  port: 5432,
});

const app = express();

// Middleware setup
app.use(
  cors({
    origin: "https://cafe-project-pos.vercel.app", // Vercel frontend
    credentials: true,
  })
); // Enable CORS
app.use(express.json()); // Parse incoming JSON
app.use("/uploads", express.static("uploads")); // Serve uploaded image files

// Use modular routes
app.use("/api/products", productsRoutes);
app.use("/api/tables", tablesRoutes);

/**
 * POST /api/tables/:tableId/add-product
 * Adds a product to a specific table or increases quantity if it already exists
 */
app.post("/api/tables/:tableId/add-product", async (req, res) => {
  const { tableId } = req.params;
  const { productId } = req.body;

  console.log("Adding product to table:", tableId, "Product ID:", productId);

  try {
    await db.query(
      `INSERT INTO table_products (table_id, product_id, quantity, status)
       VALUES ($1, $2, 1, 'pending')
       ON CONFLICT (table_id, product_id)
       DO UPDATE SET quantity = table_products.quantity + 1`,
      [tableId, productId]
    );
    res.status(200).json({ message: "Product added or quantity updated" });
  } catch (err) {
    console.error("Error adding product to table:", err);
    res.status(500).json({ error: "Failed to add product to table" });
  }
});

/**
 * GET /api/tables/:tableId/products
 * Retrieves all products assigned to a specific table
 */
app.get("/api/tables/:tableId/products", async (req, res) => {
  const { tableId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT p.*, tp.id AS table_product_id, tp.quantity, tp.status
      FROM table_products tp
      JOIN products p ON p.id = tp.product_id
      WHERE tp.table_id = $1
    `,
      [tableId]
    );

    res.json(result.rows); // Return products associated with the table
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Failed to fetch table products" });
  }
});

/**
 * DELETE /api/tables/:tableId
 * Deletes a table and all related product assignments
 */
app.delete("/api/tables/:tableId", async (req, res) => {
  const { tableId } = req.params;

  try {
    // First delete products related to this table
    await db.query(`DELETE FROM table_products WHERE table_id = $1`, [tableId]);

    // Then delete the table itself
    await db.query(`DELETE FROM tables WHERE id = $1`, [tableId]);

    res.status(200).json({ message: "Table and associated data deleted" });
  } catch (err) {
    console.error("Error deleting table:", err);
    res.status(500).json({ error: "Failed to delete table" });
  }
});

/**
 * DELETE /api/products/:id
 * Deletes a product only if it's not currently assigned to any table
 */
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the product is associated with any table
    const check = await db.query(
      `SELECT * FROM table_products WHERE product_id = $1`,
      [id]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        error: "Cannot delete. Product is assigned to a table.",
      });
    }

    // Safe to delete
    await db.query(`DELETE FROM products WHERE id = $1`, [id]);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/**
 * DELETE /api/tables/:tableId/products/:productId
 * Removes a specific product from a specific table
 */
app.delete("/api/tables/:tableId/products/:productId", async (req, res) => {
  const { tableId, productId } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM table_products WHERE table_id = $1 AND product_id = $2`,
      [tableId, productId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Product not found for this table" });
    }

    res.status(200).json({ message: "Product removed from table" });
  } catch (err) {
    console.error("Error deleting product from table:", err);
    res.status(500).json({ error: "Failed to delete product from table" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
