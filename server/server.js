import express from 'express';
import config from './config/config.js';
const app = express();
app.listen(config.port, '0.0.0.0');
