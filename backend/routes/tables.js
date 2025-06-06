// Import required modules
const express = require("express");
const router = express.Router();
const pool = require("../db"); // PostgreSQL connection pool

/**
 * GET / - Retrieve all tables from the database
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tables");
    res.json(result.rows); // Send all tables as JSON
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST / - Create a new table
 * Expects: JSON body with a "name" field
 */
router.post("/", async (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name) return res.status(400).json({ error: "Name required" });

  try {
    // Insert the new table into the database
    const result = await pool.query(
      "INSERT INTO tables (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]); // Return the newly created table
  } catch (err) {
    console.error("Error creating table:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /:tableId/add-product - Add a product to a specific table
 * Expects: JSON body with "productId"
 * Logic:
 * - If a product is already associated with the table, increment quantity
 * - Otherwise, insert it with quantity = 1 and status = 'pending'
 */
router.post("/:tableId/add-product", async (req, res) => {
  const { tableId } = req.params;
  const { productId } = req.body;

  // Validate input
  if (!productId)
    return res.status(400).json({ error: "productId is required" });

  try {
    // Insert or update the product-table relationship
    await pool.query(
      `INSERT INTO table_products (table_id, product_id, quantity, status)
       VALUES ($1, $2, 1, 'pending')
       ON CONFLICT (table_id, product_id)
       DO UPDATE SET quantity = table_products.quantity + 1`,
      [tableId, productId]
    );

    res.status(200).json({ message: "Product added to table successfully" });
  } catch (err) {
    console.error("Error adding product to table:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router to be used in the main server file
module.exports = router;
