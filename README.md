# gstyle-motors

## Project Overview
Gstyle Motors is a cutting-edge platform designed to streamline the vehicle buying and selling process. It connects car enthusiasts, buyers, and sellers, providing a user-friendly interface and various tools for efficient transactions.

## Features
- **User Authentication**: Secure login and registration for users.
- **Vehicle Listings**: Users can browse and list vehicles for sale with detailed descriptions.
- **Search and Filter**: Advanced search functionality to find vehicles based on various parameters such as make, model, price, and location.
- **User Profiles**: Personal profiles for buyers and sellers with ratings and reviews.
- **Messaging System**: Integrated messaging between buyers and sellers for communication.
- **Payment Integration**: Secure payment processing for transactions.

## Tech Stack
- **Frontend**: React.js, Redux, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Heroku/AWS

## Setup Instructions
### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (either locally or using a cloud service like MongoDB Atlas)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/maicontsuda/gstyle.git
   cd gstyle
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables by creating a `.env` file in the root directory and adding your configurations, e.g.,
   ```plaintext
   MONGODB_URI=your_mongo_db_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Access the application at `http://localhost:3000`.