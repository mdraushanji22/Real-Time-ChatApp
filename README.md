# Real-Time Chat Application

A full-stack real-time chat application built with modern web technologies. This application allows users to register, login, and chat with other online users in real-time.

## Technologies Used

### Frontend (Client)
- **React** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Redux Toolkit** - State management library
- **React Router** - Declarative routing for React
- **Socket.IO Client** - Real-time bidirectional event-based communication
- **Axios** - Promise based HTTP client for making API requests
- **Lucide React** - Beautiful & consistent icon toolkit
- **Emoji Mart** - Customizable emoji picker component
- **React Toastify** - Toast notifications for React

### Backend (Server)
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling tool
- **Socket.IO** - Real-time bidirectional event-based communication
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt.js** - Library for hashing passwords
- **Cloudinary** - Cloud-based image and video management service
- **Dotenv** - Module to load environment variables from a .env file

## Features

- User authentication (Register/Login/Logout)
- Real-time messaging with online status indicators
- Emoji support in messages
- Image sharing capability
- Responsive design for all device sizes
- Online user presence detection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)

## Installation

### Clone the repository
```bash
git clone <repository-url>
cd Real-Time-ChatApp
```

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `config.env` file in the `server/config/` directory with the following variables:
   ```
   MONGO_URI = your_mongodb_connection_string
   PORT = 4000
   CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name
   CLOUDINARY_API_KEY = your_cloudinary_api_key
   CLOUDINARY_API_SECRET = your_cloudinary_api_secret
   JWT_SECRET_KEY = your_jwt_secret_key
   JWT_EXPIRE = 7d
   COOKIE_EXPIRE = 7
   NODE_ENV = development
   FRONTEND_URL = http://localhost:5173
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend Server
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Start the server:
   ```bash
   npm run dev
   ```
   The server will start on port 4000 by default.

### Start the Frontend Application
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The client will start on port 5173 by default.

### Access the Application
Open your browser and navigate to `http://localhost:5173` to access the chat application.

## Project Structure

### Client Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility libraries (axios, socket)
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
```

### Server Structure
```
server/
├── controllers/        # Request handlers
├── database/           # Database connection
├── middlewares/        # Custom middlewares
├── models/             # Mongoose models
├── routes/             # API routes
├── utils/              # Utility functions
├── app.js              # Express application setup
└── server.js           # Server entry point
```

## Environment Variables

### Server Environment Variables
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 4000)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `JWT_EXPIRE`: JWT token expiration time
- `COOKIE_EXPIRE`: Cookie expiration time (in days)
- `NODE_ENV`: Node environment (development/production)
- `FRONTEND_URL`: Frontend application URL

## API Endpoints

### User Routes
- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - Login user
- `GET /api/v1/user/logout` - Logout user
- `GET /api/v1/user/me` - Get logged-in user details
- `GET /api/v1/user/all` - Get all users
- `PUT /api/v1/user/update/profile` - Update user profile
- `PUT /api/v1/user/update/password` - Update user password

### Message Routes
- `POST /api/v1/message/send` - Send a new message
- `GET /api/v1/message/:id` - Get all messages for a conversation

## Real-time Features

The application uses Socket.IO for real-time communication:
- Instant message delivery
- Online user status updates
- Typing indicators (implementation pending)
- Message read receipts (implementation pending)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.