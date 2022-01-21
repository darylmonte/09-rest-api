'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

// Route that will return all properties and values for the currently authenticated User 
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
  let courses = await Course.findAll({
    attributes: {
      exclude: ['userId', 'createdAt', 'updatedAt']
    },
    include: [{
      model: User,
      as: 'User',
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    }]
  });
  res.status(200).json(courses);
}));

// GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
  let course = await Course.findOne({
    where: { id: req.params.id },
    attributes: {
      exclude: ['userId', 'createdAt', 'updatedAt']
    },
    include: [{
      model: User,
      as: 'User',
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    }]
  });
  if (course) {
    res.status(200).json(course);
  } else {
    res.status(200).json({ message: `Unable to find user for ${req.params.title}` });
  }
}));

// POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
      const user = req.currentUser;
      const course = await Course.create({
          title: req.body.title,
          description: req.body.description,
          estimatedTime: req.body.estimatedTime,
          materialsNeeded: req.body.materialsNeeded,
          userId: user.id,
      });
      res.status(201).location(`/courses/${course.id}`).end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map((err) => err.message);
          res.status(400).json({ errors });
      } else {
          throw error;
      }
    }
}));

// PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  try {
      const user = req.currentUser;
      const course = await Course.findByPk(req.params.id);

      if(course) {
          if(course.userId === user.id) {
              if (!req.body.title) {
                  req.body.title = '';
              }
              if (!req.body.description) {
                  req.body.description = '';
              }
              await Course.update(req.body, {
                  where: { id: req.params.id },
              });
              res.status(204).end();
          } else {
              res.status(403).json({
                  message: 'Access Denied: Only the course owner may update this course'
              });
              error.name = 'Access Error';
          throw error;
          }
      } else {
          res.status(400).json({
              message: 'Unable to update a course that does not exist'
          });
      }
  } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map((err) => err.message);
          res.status(400).json({ errors });
      } else {
          throw error;
      }
  }
}));

// DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  if (course) {
      if(course.userId === user.id) {
          course.destroy(course);
          res.status(204).end();
      } else {
          res.status(401).json({
              message: 'Permission denied. Only the course owner may delete this course'
          });
      }
  } else {
      res.status(400).json({
          message: 'Unable to delete a course that does not exist'
      });
  }
}));


module.exports = router;