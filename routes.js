const express = require('express');
const { v4: uuidv4 } = require('uuid');
const validateProduct = require('./middleware/validateProduct'); // Import custom validation middleware
const NotFoundError = require('./errors/NotFoundError'); // Import custom NotFoundError
const { router } = require('./server');

module.exports =function(products) {
const router = express.Router();

// Middleware to parse JSON bodies
router.post('/api/products', validateProduct); // Use the validation middleware for POST requests
router.put('/api/products/:id', validateProduct); // Use the validation middleware for PUT requests


// list all products
router.get('/api/products', (req, res) => {
    let result = products;


// Filter products by category
if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }
  
  // Search products by name
  if (req.query.search) {
    result = result.filter(p =>
         p.name.toLowerCase().includes(req.query.search.toLowerCase())
        );
  }
  
//Pagination for products
//Add limit and page query parameters:
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  res.json(result.slice(start, end));
});
    
//route for getting product statistics
router.get('/api/products/stats', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

// get a specific product by id
router.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

// create a new product
router.post('/api/products', (req, res) => {
    const { name, description, price, category, inStock } = req.body;
    if (!name || !description || price === undefined || !category || inStock === undefined) {
        return res.status(400).json({ error: 'All product fields are required' });
    }
    const newProduct = {
        id: uuidv4(),
        name,
        description,
        price,
        category,
        inStock
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});


// update a product
router.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, inStock } = req.body;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Update fields if provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (inStock !== undefined) product.inStock = inStock;

    res.json(product);
});


// delete a product
router.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products.splice(index, 1)[0];
    res.json({ message: 'Product deleted', product: deletedProduct });
});

return router;
};