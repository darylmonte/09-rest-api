'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

// Route that will return all properties and values for the currently authenticated User 
// Authentication successful and displays the correct user but have this error: GET /api/users 500
// Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  //let users = await User.findAll();
  // res.status(200).json(users);
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));

// Route that will create a new user
// gets 400 Bad Request
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201).location('/').end();
  } catch (error) {
    console.log('ERROR: ', error.name);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async (req, res) => {
  let courses = await Course.findAll();
  res.status(200).json(courses);
}));

// GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
  
}));

// POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', asyncHandler(async (req, res) => {
  
}));

// PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', asyncHandler(async (req, res) => {
  
}));

// DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', asyncHandler(async (req, res) => {
  
}));


module.exports = router;