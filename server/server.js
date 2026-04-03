import app from './express.js';
import config from './config/config.js';
app.listen(config.port, '0.0.0.0');
