import http from 'http';
import config from './config/config.js';
import app from './express.js';
import mongoose from 'mongoose';
import bidding from './controllers/bidding.controller.js';

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  dbName: config.mongoDbName,
  autoIndex: false,
});

mongoose.connection.on('error', () => {
  throw new Error('Unable to connect to the database.');
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB.');
});

const server = http.createServer(app);
bidding(server);

server.listen(config.port, '0.0.0.0', err => {
  if (err) {
    console.error(err);
  }
  console.info('Server started on port %s', config.port);
});
