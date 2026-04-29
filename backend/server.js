const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==================== MOCK DATA ====================

const products = [
  {
    id: 1,
    name: 'Vitamin D3 1000IU',
    category: 'vitamins',
    price: 12.99,
    image: 'https://via.placeholder.com/150?text=Vitamin+D3',
    description: 'Supports bone health and immune function',
    ingredients: ['Cholecalciferol (Vitamin D3)', 'Olive Oil'],
    tags: ['immunity', 'bones', 'elderly']
  },
  {
    id: 2,
    name: 'Omega-3 Fish Oil',
    category: 'supplements',
    price: 18.99,
    image: 'https://via.placeholder.com/150?text=Fish+Oil',
    description: 'Supports heart and brain health',
    ingredients: ['Fish Oil (EPA/DHA)', 'Gelatin', 'Glycerin'],
    tags: ['heart-health', 'brain', 'athletes']
  },
  {
    id: 3,
    name: 'Probiotics 50B CFU',
    category: 'supplements',
    price: 24.99,
    image: 'https://via.placeholder.com/150?text=Probiotics',
    description: 'Promotes digestive and gut health',
    ingredients: ['Lactobacillus', 'Bifidobacterium', 'Prebiotic Fiber'],
    tags: ['digestive', 'seniors', 'athletes']
  },
  {
    id: 4,
    name: 'Multivitamin Complete',
    category: 'vitamins',
    price: 15.99,
    image: 'https://via.placeholder.com/150?text=Multivitamin',
    description: 'Daily essential vitamins and minerals',
    ingredients: ['Vitamin A', 'Vitamin C', 'Iron', 'Calcium', 'Zinc'],
    tags: ['immunity', 'energy', 'general-wellness']
  },
  {
    id: 5,
    name: 'Magnesium Glycinate',
    category: 'minerals',
    price: 16.99,
    image: 'https://via.placeholder.com/150?text=Magnesium',
    description: 'Supports muscle relaxation and sleep quality',
    ingredients: ['Magnesium Glycinate', 'Cellulose'],
    tags: ['sleep', 'stress', 'muscles']
  }
];

// Health quiz questions and scoring logic
const quizQuestions = [
  {
    id: 1,
    question: 'What is your primary health concern?',
    options: [
      { text: 'Energy & Fatigue', value: 'energy' },
      { text: 'Digestion & Gut Health', value: 'digestive' },
      { text: 'Heart & Brain Health', value: 'heart-health' },
      { text: 'Immunity & Wellness', value: 'immunity' }
    ]
  },
  {
    id: 2,
    question: 'What is your age group?',
    options: [
      { text: 'Under 30', value: 'young' },
      { text: '30-50', value: 'adult' },
      { text: '50-65', value: 'senior' },
      { text: '65+', value: 'elderly' }
    ]
  },
  {
    id: 3,
    question: 'Are you an athlete or exercise regularly?',
    options: [
      { text: 'Yes, regularly', value: 'athletes' },
      { text: 'Sometimes', value: 'moderate' },
      { text: 'Not really', value: 'sedentary' }
    ]
  }
];

// ==================== ROUTES ====================

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Search products
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.ingredients.some(i => i.toLowerCase().includes(query))
  );
  res.json(results);
});

// Get quiz questions
app.get('/api/quiz', (req, res) => {
  res.json(quizQuestions);
});

// Submit quiz and get recommendations
app.post('/api/quiz/submit', (req, res) => {
  const { answers } = req.body;

  // Extract tags from answers
  const tags = [];
  if (answers[0]) tags.push(answers[0]);
  if (answers[1]) tags.push(answers[1]);
  if (answers[2]) tags.push(answers[2]);

  // Recommend products that match tags
  const recommendations = products.filter(p =>
    p.tags.some(tag => tags.includes(tag))
  ).slice(0, 5);

  res.json({
    recommendations,
    personalizedMessage: `Based on your profile, we recommend these supplements for ${answers[0] || 'general wellness'}.`
  });
});

// Mock checkout/payment
app.post('/api/checkout', (req, res) => {
  const { cartItems, customerInfo } = req.body;
  const orderId = 'ORD-' + Date.now();
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({
    orderId,
    status: 'success',
    total: total.toFixed(2),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
    message: 'Order placed successfully!'
  });
});

// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
