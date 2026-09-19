# Fresh Cart v2

A full-stack grocery e-commerce application built with TypeScript, React, Next.js, and MySQL.

---

## 📺 Live Demo

[Fresh Cart](https://fresh-cart-v2-eta.vercel.app/)

---

## 🎯 Why I Built This Project

Through coursework and academic projects, I've developed a strong foundation in web development.
However, I wanted to go beyond assignments and build my own application from scratch to deepen my understanding and gain hands-on experience with the end-to-end development process, from relational database design and REST API development to automated testing and cloud deployment.

---

## 🛠 Tech Stack

- Frontend: TypeScript, React, Next.js
- Backend: Next.js Route Handlers (REST APIs)
- Database: MySQL
- Testing: Jest, React Testing Library
- Deployment: Vercel (Public Demo), Railway, AWS EC2, Nginx (Reverse Proxy)
- Containerization: Docker, Docker Compose
- Version Control: Git, GitHub

---

## 🚀 Deployment

### Public Demo

- The public demo is available on Vercel.

### Cloud Deployment Experience

- Containerized the application using Docker
- Managed the application and database containers using Docker Compose
- Deployed the application to an AWS EC2 instance
- Configured production environment variables for secure database connectivity and application configuration

---

## 🧩 Features

- Browse products by category and view product details
- Search products with search suggestions and view search results
- Add products to the cart and complete checkout
- Merge guest cart items after a successful sign-in
- Sign up and sign in securely
- Add and manage shipping addresses

---

## 📸 Screenshots

### Main Page

![Main](./screenshots/main.jpg)

### Product List

![Product List](./screenshots/products_meat.jpg)

### Product Detail

![Product Detail](./screenshots/products_detail.jpg)

### Search & Search Results

![Search](./screenshots/search.jpg)

![Search Results](./screenshots/search_results.jpg)

### Cart

![Cart](./screenshots/cart.jpg)

### Checkout

![Checkout](./screenshots/checkout.jpg)

---

## 📈 Major Challenges & Solutions

### Preserving Guest Cart Items

**Problem:**
Guest cart items are lost when users sign in because guest and authenticated carts are managed separately.

**Solution:**
Store guest cart items in localStorage and merge them with the user’s cart after sign-in, allowing users to continue shopping seamlessly.

---

### Preventing Open Redirects

**Problem:**
Using unvalidated redirect URLs can expose users to phishing attacks and credential theft.

**Solution:**
Implement a redirect map and allow navigation only to predefined routes.

---

### Handling Failed Order Requests

**Problem:**
The "Placing Order..." button remains disabled when order creation fails, preventing users from retrying the checkout process.

**Solution:**
Add a finally block and reset the submitting state so that users can retry the checkout process after a failed order request.

---

## 🔮 Future Improvements

- Redesign the Account Dashboard with a card-based layout
- Implement an Order Details page
- Add Reorder, Payment Processing, and Buy Now functionality

---

## 📦 Installation / Setup

### Local Development

1. Clone the repository.

```bash
git clone https://github.com/chloejo-dev/fresh-cart-v2.git
```

2. Navigate to the project directory.

```bash
cd fresh-cart-v2
```

3. Install dependencies.

```bash
npm install
```

4. Create a `.env.local` file and add the required environment variables.

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

5. Start the development server.

```bash
npm run dev
```

6. Open your browser and visit:

```text
http://localhost:3000
```

---

### Run with Docker

Run the application using Docker Compose.

```bash
docker compose up --build
```

---

## 👤 Author

- Chloe Jo
- GitHub: [chloejo-dev](https://github.com/chloejo-dev)
