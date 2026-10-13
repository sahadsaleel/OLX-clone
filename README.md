# OLX Clone – React & Firebase Marketplace

A modern, responsive **OLX Clone** built with **React**, **Vite**, **Firebase Authentication**, **Cloud Firestore**, and **React Router DOM**.

---

## 🚀 Features

- **OLX Marketplace UI**: Authentic OLX header with location selector, search bar, language switcher, category sub-bar, recommendations grid, and multi-column footer.
- **Firebase Authentication**:
  - Secure Email/Password signup and login.
  - Persistent login state using Firebase `onAuthStateChanged`.
  - Header displays active user email and Logout button.
- **Cloud Firestore Backend**:
  - Real-time instant caching and fetching of posted ads.
  - Form to sell products (`/sell`) with image URL, price in INR, category, location, and description.
  - Stored with seller user ID (`sellerId`).
- **Product Details Page (`/product/:id`)**:
  - Instant zero-lag transition using route state and local cache.
  - Full-resolution preview, seller badge, and "Chat with seller" reveal.
  - Buyer safety tips guide.
- **Wishlist System (`/wishlist`)**:
  - Toggle products in/out of wishlist with the heart icon.
  - Persistent per-user wishlist stored in local storage.
  - Dedicated Wishlist page to review or remove saved ads.
- **Protected Routes**:
  - `/sell` and `/wishlist` are guarded by `ProtectedRoute`.
  - Automatically redirects unauthenticated guests to `/login`.
- **Responsive Design**:
  - Seamless layout across desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ES6+), Vanilla CSS (Flexbox & Grid)
- **Build Tool**: Vite
- **Routing**: React Router DOM (v7)
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **Icons & Assets**: Custom SVG icons and brand assets

---

## 📁 Project Structure

```text
src/
├── assets/                  # Brand logos and SVG icons
├── components/
│   ├── Footer/              # Multi-column footer
│   ├── Navbar/              # Sticky header with search, categories & auth links
│   ├── ProductCard/         # Reusable card with lazy loading & heart toggle
│   └── ProtectedRoute/      # Route guard for authenticated users
├── context/
│   ├── AuthContext.jsx      # Firebase auth provider & hooks
│   └── WishlistContext.jsx  # Wishlist state provider & persistent storage
├── firebase/
│   └── firebase.js          # Modular Firebase app, auth & db initialization
├── pages/
│   ├── Home/                # Main recommendations feed & banner
│   ├── Login/               # Email/Password sign-in
│   ├── ProductDetails/      # Single ad view with seller details
│   ├── SellProduct/         # Post an ad form
│   ├── Signup/              # New user registration
│   └── Wishlist/            # Saved products page
├── App.css
├── App.jsx                  # Main routing configuration
├── index.css                # Global CSS reset and typography
└── main.jsx                 # React root entry point
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd olx-clone
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id_here
```

> **Note:** The `.env` file is excluded in `.gitignore` to keep your credentials secure.

### 4. Enable Firebase Services
In the [Firebase Console](https://console.firebase.google.com/):
1. **Authentication**: Enable **Email/Password** under *Sign-in method*.
2. **Firestore Database**: Create a database (test mode or production mode).

### 5. Run the development server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🔒 Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.sellerId;
    }
  }
}
```

---

## 📄 License
This project is open-source and intended for educational purposes.
