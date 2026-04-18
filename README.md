# 🚀 REST API with Node.js, Express & MongoDB

A RESTful API built with Node.js, Express, and MongoDB featuring user authentication, role-based access control, and image uploads via Cloudinary.

---

## 🛠️ Tech Stack

- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM for MongoDB
- **JWT** — Authentication
- **Bcrypt** — Password hashing
- **Multer** — File upload handling
- **Cloudinary** — Cloud image storage

---

## 📁 Project Structure

```
├── config/
│   └── cloudinary.js           # Cloudinary configuration
├── controller/
│   ├── courses.controller.js   # Courses business logic
│   └── users.controller.js     # Users business logic
├── middleware/
│   ├── allowedTo.js            # Role-based access control
│   ├── asyncWrapper.js         # Async error handler wrapper
│   ├── uploadImage.js          # Multer + Cloudinary setup
│   ├── validation.js           # Request validation
│   └── verifyJwt.js            # JWT verification
├── models/
│   ├── courses.model.js        # Course schema
│   └── users.model.js          # User schema
├── routes/
│   ├── courses.route.js        # Course routes
│   └── users.route.js          # User routes
├── utils/
│   ├── appError.js             # Custom error class
│   ├── generateJwt.js          # JWT generator
│   ├── httpStatus.js           # HTTP status constants
│   └── users.role.js           # User roles constants
├── .env                        # Environment variables (not committed)
├── .gitignore
├── app.js                      # Express app setup
├── index.js                    # Entry point / server start
└── package.json
```

---

## ⚙️ Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

**2. Install dependencies**
```bash
npm install
```

**3. Create `.env` file** in the root directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**4. Run the server**
```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

---

## 📌 API Endpoints

### Users

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/users/register` | Register new user | Public |
| `POST` | `/api/users/login` | Login user | Public |
| `GET` | `/api/users` | Get all users | Admin, Manager |
| `POST` | `/api/users/changerole` | Change user role | Admin |

### Courses

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/courses` | Get all courses | Public |
| `POST` | `/api/courses` | Create a course | Admin, Manager |

---

## 📤 Register User

**POST** `/api/users/register`

Send as `multipart/form-data`:

| Field | Type | Required |
|---|---|---|
| `firstName` | String | ✅ |
| `lastName` | String | ✅ |
| `email` | String | ✅ |
| `password` | String | ✅ |
| `avatar` | File (image) | ❌ |

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "avatar": "https://res.cloudinary.com/..."
    }
  }
}
```

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| `USER` | Basic access |
| `MANAGER` | View all users, create courses |
| `ADMIN` | Full access including role management |

---

## 🖼️ Image Upload

- Images are uploaded directly to **Cloudinary** (no local storage)
- Accepted formats: `jpg`, `jpeg`, `png`
- Max file size: **2MB**
- If no avatar is provided, a default image is used

---

## 🔒 Authentication

Protected routes require a JWT token in the request header:

```
Authorization: Bearer <your_token>
```

---

## 🚫 .gitignore

Make sure your `.gitignore` includes:

```
node_modules/
.env
uploads/
```

---

## 📄 License

MIT