const auth = require('basic-auth'); //  npm install basic-auth
const bcrypt = require('bcrypt');
const { User } = require('../models');

'use strict';

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
  let message; 
  const credentials = auth(req); // user's key and secret
  if (credentials) {
    const user = await User.findOne({ where: { emailAddress: credentials.name } });
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.emailAddress}`;
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
  
  next();
}