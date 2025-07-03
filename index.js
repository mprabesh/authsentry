const { connectDB } = require('./db');
const auth = require('./auth');
const middleware = require('./middleware');

module.exports = {
  connectDB,
  ...auth,
  ...middleware
};
