import express from 'express';
import servicesRouter from './routes/services.router.js';
import RoutingDetector from './middlewares/routingDetector.middleware.js';

const app = express();

//middlewares
app.use(express.json());
app.use(RoutingDetector);

//Router 
app.use('/api/services', servicesRouter);

export default app;