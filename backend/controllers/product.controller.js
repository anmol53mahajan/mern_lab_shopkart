const mongoose = require("mongoose");
const Product = require("../models/product.model");

// POST /products - Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate presence
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, description, price, category, image, stock)",
      });
    }

    // Validate constraints
    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      stock: Number(stock),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error creating product",
      error: error.message,
    });
  }
};

// GET /products - Fetch all products with dynamic search, category filter & sorting
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    // Case-insensitive regex search on name
    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category
    if (category && category.trim() !== "" && category !== "All") {
      filter.category = category.trim();
    }

    // Sorting (Bonus Challenge)
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .select("_id name price category image stock createdAt")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching products",
      error: error.message,
    });
  }
};

// GET /products/:id - Fetch single product by MongoDB _id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching product",
      error: error.message,
    });
  }
};