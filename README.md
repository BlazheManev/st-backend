# ST-User Backend

This is the backend application for the ST-User project. It is built using Node.js, Express, and MongoDB. It provides APIs for user authentication, managing absences, and handling notifications.

## Features

- User authentication (login and registration)
- Manage user profiles
- Handle absence requests
- Generate and validate QR codes
- Send push notifications

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (v4 or later)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/st-user-backend.git
    cd st-user-backend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

## Running the Application

1. To run the application locally:

    ```bash
    npm start
    ```

This will start the server on the port specified in your `.env` file.

## API Endpoints

### User Routes

- **GET /users/**: Get a list of all users (auth required).
- **GET /users/get/:id**: Get details of a specific user by ID (auth required).
- **POST /users/**: Create a new user.
- **PUT /users/update/:id**: Update an existing user by ID (auth required).
- **DELETE /users/:id**: Delete a user by ID (auth required).
- **POST /users/login**: User login.
- **POST /users/:id/record**: Record entry or exit for a user (auth required).
- **POST /users/calculateWorkingHours**: Calculate worked time by interval.
- **GET /users/checkCurrentStatus**: Check current status.
- **GET /users/mostWorkingHours**: Calculate the most worked hours in the last month.
- **GET /users/:id/working-hours**: Get working hours for a specific user by ID (auth required).
- **GET /users/:id/total-earnings**: Calculate total earnings for a specific user by ID.
- **POST /users/book-equipment**: Book equipment.
- **PUT /users/return-equipment**: Return equipment.

### Absence Routes

- **POST /absence/create/new**: Create a new absence.
- **GET /absence/all**: Get a list of all absences.
- **GET /absence/user/:userId**: Get absences by user ID.
- **POST /absence/approve/:absenceId/:vacationId**: Approve vacation.
- **POST /absence/reject/:absenceId/:vacationId**: Reject vacation.

### Subscription Routes

- **POST /subscription/new**: Subscribe to push notifications.

## Code Structure

- **src/controllers**: Contains the controller files for handling requests.
- **src/models**: Contains the Mongoose models for MongoDB collections.
- **src/routes**: Contains the route definitions.
- **src/middleware**: Contains the middleware functions.
- **src/utils**: Contains utility functions.
- **src/config**: Contains configuration files.

## Deployment

To deploy your own version:

1. Push your code to a GitHub repository.
2. Create a new web service on your preferred hosting platform and connect it to your GitHub repository.
3. Set the environment variables on your hosting platform as specified in your `.env` file.
4. Set the start command to `npm start`.

## Live Demo

The backend is deployed on Render. You can access it here: [ST-User Backend](https://st-backend-7eb0.onrender.com/)

