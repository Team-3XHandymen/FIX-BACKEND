
# FIX-BACKEND

This is the backend for the FIX platform, a handyman service application. It is built with Node.js, TypeScript, Express, and MongoDB.

## Features
- RESTful API for clients, handymen, services, bookings, reviews, and notifications
- JWT-based authentication and authorization
- MongoDB database integration
- Modular architecture with controllers, models, routes, and services
- Data validation and error handling

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (local or cloud instance)

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd FIX-BACKEND
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the root directory.
   - Add the following variables (adjust as needed):
     ```env
     MONGODB_URI=mongodb://localhost:27017/fixdb
     JWT_SECRET=your_jwt_secret
     PORT=3001
     ```
4. **Run database seed scripts (optional):**
   ```sh
   npm run seed
   # or run individual scripts in src/scripts/
   ```

5. **Start the server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
   The API will be available at `http://localhost:3001/api` by default.

## Project Structure
```
FIX-BACKEND/
├── src/
│   ├── config/         # Database and environment config
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API route definitions
│   ├── scripts/        # Seed and test scripts
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── index.ts        # App entry point
├── package.json        # Project metadata and scripts
├── tsconfig.json       # TypeScript configuration
└── ...
```

## Scripts
- `npm run dev` — Start server in development mode
- `npm run build` — Build for production
- `npm start` — Start built server
- `npm run seed` — Seed database with initial data

## API Endpoints
- The API is available at `/api` (e.g., `/api/services`, `/api/bookings`)
- See the frontend or route files for available endpoints

## Notes
- Uses Mongoose for MongoDB object modeling
- Authentication via JWT tokens
- Update environment variables as needed for your setup

## Troubleshooting
- Check logs for errors
- Ensure MongoDB is running and accessible
- See `TROUBLESHOOTING.md` if available

## License
MIT