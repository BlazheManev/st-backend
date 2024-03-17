// staticRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/podatkovni-model', function(req, res) {
  res.sendFile(path.join(__dirname, '../pages/dataModel.html'));
});

router.get('/REST', function(req, res) {
  res.type('text').send(
    `REST API Services:

1. User Management
   - GET /users: Retrieves a list of all users.
   - GET /users/:id: Retrieves detailed information of a specific user by ID.
   - POST /users: Registers a new user.
   - PUT /users/:id: Updates the information of an existing user.
   - DELETE /users/:id: Removes a user from the system.
   - POST /users/login: Authenticates a user and initiates a session.

2. Work Time Tracking
   - POST /users/:id/record: Records a user's entry (vhod) or exit (izhod) timestamp.

The REST API is designed to support a hybrid desktop application, allowing for operations to be performed both online and offline with synchronization capabilities.`
  );
});

module.exports = router;
