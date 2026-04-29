# HealthSupp - Healthcare Supplements PWA

A complete e-commerce Progressive Web App for healthcare supplements with full journey support: Browse → Health Quiz → Recommendations → Product View → Cart → Checkout

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App will open on `http://localhost:3000`

## 📱 Features

### Full E-Commerce Journey
1. **Browse & Search** - Browse all supplements, search by name or ingredient
2. **Health Quiz** - 3-question personalized health assessment
3. **Recommendations** - AI-powered recommendations based on quiz answers
4. **Product View** - Detailed product view with ingredients and health tags
5. **Shopping Cart** - Add/remove items, adjust quantities
6. **Checkout** - Shipping & payment (mocked for demo)
7. **Order Confirmation** - Order success with tracking info

### PWA Features
- ✅ **Installable** - Add to home screen on mobile
- ✅ **Offline Support** - Service worker with offline caching
- ✅ **Responsive** - Works on desktop, tablet, mobile
- ✅ **Fast** - Optimized performance and instant loads

## 🏗️ Architecture

```
HealthSupp/
├── backend/
│   ├── server.js         # Express API
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json (PWA manifest)
│   │   └── service-worker.js
│   ├── src/
│   │   ├── App.js        # Main app with routing
│   │   ├── components/   # All journey screens
│   │   └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | Get all products |
| `/api/products/:id` | GET | Get product by ID |
| `/api/search?q=query` | GET | Search products |
| `/api/quiz` | GET | Get health quiz questions |
| `/api/quiz/submit` | POST | Submit quiz and get recommendations |
| `/api/checkout` | POST | Process checkout (mocked) |

## 📦 Mock Data

The app comes with 5 sample supplements:
- Vitamin D3 1000IU
- Omega-3 Fish Oil
- Probiotics 50B CFU
- Multivitamin Complete
- Magnesium Glycinate

Health quiz covers:
- Primary health concerns (energy, digestion, heart health, immunity)
- Age groups (under 30, 30-50, 50-65, 65+)
- Activity level (athlete, moderate, sedentary)

## 🎨 Styling

- Custom CSS for responsive design
- Mobile-first approach
- Color scheme: Green (#4CAF50) for primary actions, orange for recommendations
- Smooth transitions and animations

## 💳 Payment

Currently mocked with test card credentials:
- Card: 4111111111111111
- Expiry: 12/25
- CVV: 123

To integrate real payment: Update `/api/checkout` endpoint with Stripe/PayPal

## 🚀 Next Steps (Optional Enhancements)

1. **Authentication** - Add user accounts, saved carts
2. **Real Database** - Replace mock data with PostgreSQL/MongoDB
3. **Real Payments** - Integrate Stripe/PayPal
4. **Admin Dashboard** - Manage products, orders
5. **Push Notifications** - Order status updates
6. **Analytics** - Track user journeys
7. **Azure Deployment** - Deploy to App Service + Functions

## 📱 Installing as PWA

1. On mobile: Open app → Menu → Install app
2. On desktop: Address bar → Install button
3. App will appear on home screen like native app

## 🔧 Environment Variables

Create `.env` in frontend folder (optional):
```
REACT_APP_API_URL=http://localhost:5000
```

## 📝 License

MIT
