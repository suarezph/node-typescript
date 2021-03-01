import http from 'http';
import express from 'express';
import loggng from './config/logging';
import config from './config/config';
import logging from './config/logging';
import mongoose from 'mongoose';
import bookRouters from './routes/book';
import UserRouters from './routes/user';

const NAMESPACE = 'Server';
const router = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info(NAMESPACE, 'Connected to mongoDB');
    })
    .catch((error) => {
        logging.info(NAMESPACE, error.message, error);
    });

/** Logging the request */
router.use((req, res, next) => {
    loggng.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        loggng.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
    });

    next();
});

/** Parse the request */
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

/** Rules of our API */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST PUT');
        return res.status(200).json({});
    }

    next();
});

/** Routes */
router.use('/api/books', bookRouters);
router.use('/api/users', UserRouters);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found!');

    return res.status(400).json({
        message: error.message
    });
});

/** Create Server */
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`));
