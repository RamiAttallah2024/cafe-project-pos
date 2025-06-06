// Import required modules
const express = require("express");
const multer = require("multer");
const pool = require("../db"); // PostgreSQL connection pool
const router = express.Router();

// Configure multer storage for uploaded files
const storage = multer.diskStorage({
  // Set destination folder for uploads
  destination: (req, file, cb) => cb(null, "uploads/"),
  // Set filename to be the current timestamp followed by original name
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Create multer upload middleware using the defined storage
const upload = multer({ storage });

/**
 * GET / - Fetch all products from the database
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows); // Send all product records as JSON
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST / - Add a new product with image upload
 * Expects: multipart/form-data with fields: name, price, type, image
 */
router.post("/", upload.single("image"), async (req, res) => {
  const { name, price, type } = req.body;
  const image = req.file?.path; // Get uploaded file path

  // Validate required fields
  if (!name || !price || !type || !image) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Insert new product into the database
    const result = await pool.query(
      "INSERT INTO products (name, price, type, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, type, image]
    );

    // Return the newly created product
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router to be used in other parts of the application
module.exports = router;
