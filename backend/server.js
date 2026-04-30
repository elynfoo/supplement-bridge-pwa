const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'healthsupp-dev-secret-change-in-prod';

// ==================== MOCK DATA ====================

let products = [
  {
    id: 1, name: 'Vitamin D3 1000IU', category: 'vitamins', price: 12.99, stock: 142,
    image: 'https://via.placeholder.com/150?text=Vitamin+D3',
    description: 'Supports bone health and immune function',
    ingredients: ['Cholecalciferol (Vitamin D3)', 'Olive Oil'],
    tags: ['immunity', 'bones', 'elderly']
  },
  {
    id: 2, name: 'Omega-3 Fish Oil', category: 'supplements', price: 18.99, stock: 87,
    image: 'https://via.placeholder.com/150?text=Fish+Oil',
    description: 'Supports heart and brain health',
    ingredients: ['Fish Oil (EPA/DHA)', 'Gelatin', 'Glycerin'],
    tags: ['heart-health', 'brain', 'athletes']
  },
  {
    id: 3, name: 'Probiotics 50B CFU', category: 'supplements', price: 24.99, stock: 8,
    image: 'https://via.placeholder.com/150?text=Probiotics',
    description: 'Promotes digestive and gut health',
    ingredients: ['Lactobacillus', 'Bifidobacterium', 'Prebiotic Fiber'],
    tags: ['digestive', 'seniors', 'athletes']
  },
  {
    id: 4, name: 'Multivitamin Complete', category: 'vitamins', price: 15.99, stock: 203,
    image: 'https://via.placeholder.com/150?text=Multivitamin',
    description: 'Daily essential vitamins and minerals',
    ingredients: ['Vitamin A', 'Vitamin C', 'Iron', 'Calcium', 'Zinc'],
    tags: ['immunity', 'energy', 'general-wellness']
  },
  {
    id: 5, name: 'Magnesium Glycinate', category: 'minerals', price: 16.99, stock: 0,
    image: 'https://via.placeholder.com/150?text=Magnesium',
    description: 'Supports muscle relaxation and sleep quality',
    ingredients: ['Magnesium Glycinate', 'Cellulose'],
    tags: ['sleep', 'stress', 'muscles']
  }
];

let users = [
  {
    id: 1, firstName: 'Admin', lastName: 'User',
    email: 'admin@healthsupp.com',
    password: bcrypt.hashSync('Admin123!', 10),
    isAdmin: true
  },
  {
    id: 2, firstName: 'Demo', lastName: 'Customer',
    email: 'demo@customer.com',
    password: bcrypt.hashSync('Demo123!', 10),
    isAdmin: false
  }
];

let orders = [];
let nextUserId = 3;
let nextOrderId = 1;

// SSE clients for admin real-time feed
const sseClients = [];

function broadcastSSE(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(msg); } catch (_) {}
  });
}

// ==================== QUIZ DATA ====================

const quizQuestions = [
  {
    id: 1, question: 'What is your primary health concern?',
    options: [
      { text: 'Energy & Fatigue', value: 'energy' },
      { text: 'Digestion & Gut Health', value: 'digestive' },
      { text: 'Heart & Brain Health', value: 'heart-health' },
      { text: 'Immunity & Wellness', value: 'immunity' }
    ]
  },
  {
    id: 2, question: 'What is your age group?',
    options: [
      { text: 'Under 30', value: 'young' },
      { text: '30-50', value: 'adult' },
      { text: '50-65', value: 'senior' },
      { text: '65+', value: 'elderly' }
    ]
  },
  {
    id: 3, question: 'Are you an athlete or exercise regularly?',
    options: [
      { text: 'Yes, regularly', value: 'athletes' },
      { text: 'Sometimes', value: 'moderate' },
      { text: 'Not really', value: 'sedentary' }
    ]
  }
];

// ==================== MIDDLEWARE ====================

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

// ==================== AUTH ====================

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'An account with this email already exists' });

  const user = {
    id: nextUserId++, firstName, lastName,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    isAdmin: false
  };
  users.push(user);

  const token = jwt.sign(
    { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: false },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.status(201).json({ token, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: false });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ token, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin });
});

app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

// ==================== PRODUCTS ====================

app.get('/api/products', (req, res) => {
  res.json(products.map(({ stock, ...p }) => p));
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { stock, ...pub } = product;
  res.json(pub);
});

app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = products
    .filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.ingredients.some(i => i.toLowerCase().includes(query))
    )
    .map(({ stock, ...p }) => p);
  res.json(results);
});

// ==================== QUIZ ====================

app.get('/api/quiz', (req, res) => res.json(quizQuestions));

app.post('/api/quiz/submit', (req, res) => {
  const { answers } = req.body;
  const tags = Object.values(answers).filter(Boolean);
  const recommendations = products
    .filter(p => p.tags.some(tag => tags.includes(tag)))
    .map(({ stock, ...p }) => p)
    .slice(0, 5);
  res.json({
    recommendations,
    personalizedMessage: `Based on your profile, we recommend these supplements for ${answers[0] || 'general wellness'}.`
  });
});

// ==================== CHECKOUT ====================

app.post('/api/checkout', authMiddleware, (req, res) => {
  const { cartItems, customerInfo } = req.body;
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartItems.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });

  const order = {
    id: `ORD-${String(nextOrderId++).padStart(4, '0')}`,
    userId: req.user.id,
    customerName: `${req.user.firstName} ${req.user.lastName}`,
    customerEmail: req.user.email,
    shippingAddress: customerInfo,
    items: cartItems,
    total: parseFloat(total.toFixed(2)),
    status: 'pending',
    placedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString()
  };
  orders.unshift(order);
  broadcastSSE('new_order', order);

  res.json({
    orderId: order.id,
    status: 'success',
    total: order.total.toFixed(2),
    estimatedDelivery: order.estimatedDelivery,
    message: 'Order placed successfully!'
  });
});

app.get('/api/orders/my', authMiddleware, (req, res) => {
  res.json(orders.filter(o => o.userId === req.user.id));
});

// ==================== ADMIN ====================

// SSE cannot send Authorization headers — accept token via query param for this endpoint only
app.get('/api/admin/events', (req, res) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  let user;
  try { user = jwt.verify(token, JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }
  if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected' })}\n\n`);
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx > -1) sseClients.splice(idx, 1);
  });
});

app.get('/api/admin/stats', adminMiddleware, (req, res) => {
  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((s, o) => s + o.total, 0).toFixed(2),
    lowStockProducts: products.filter(p => p.stock <= 10).length
  });
});

app.get('/api/admin/products', adminMiddleware, (req, res) => res.json(products));

app.post('/api/admin/products', adminMiddleware, (req, res) => {
  const { name, category, price, stock, description, ingredients, tags } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name, category: category || 'supplements',
    price: parseFloat(price), stock: parseInt(stock) || 0,
    image: `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`,
    description: description || '',
    ingredients: Array.isArray(ingredients)
      ? ingredients
      : (ingredients || '').split(',').map(s => s.trim()).filter(Boolean),
    tags: Array.isArray(tags)
      ? tags
      : (tags || '').split(',').map(s => s.trim()).filter(Boolean)
  };
  products.push(newProduct);
  broadcastSSE('product_added', newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  broadcastSSE('product_updated', products[idx]);
  res.json(products[idx]);
});

app.delete('/api/admin/products/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const [removed] = products.splice(idx, 1);
  broadcastSSE('product_deleted', { id: removed.id });
  res.json({ message: 'Product deleted' });
});

app.put('/api/admin/products/:id/stock', adminMiddleware, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.stock = Math.max(0, parseInt(req.body.stock));
  broadcastSSE('stock_updated', { id: product.id, name: product.name, stock: product.stock });
  res.json(product);
});

app.get('/api/admin/orders', adminMiddleware, (req, res) => res.json(orders));

app.put('/api/admin/orders/:id/status', adminMiddleware, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(req.body.status))
    return res.status(400).json({ error: 'Invalid status' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  broadcastSSE('order_updated', { id: order.id, status: order.status });
  res.json(order);
});

// ==================== HEALTH ====================

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`  Admin: admin@healthsupp.com / Admin123!`);
  console.log(`  Demo customer: demo@customer.com / Demo123!`);
});
