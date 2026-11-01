import express from 'express';
import path from 'path';
import { env } from './config/env.config.js';
import ServiceManager from './managers/ServiceManager.js';

const app = express();
const PORT = env.PORT || 8080;

const databasePath = path.join(import.meta.dirname, 'data', 'services.json');
const manager = new ServiceManager(databasePath);

app.use(express.json());

// Obtener los servicios
app.get('/api/services', async (req, res) => {
    try {
        const services = await manager.getServices();
        res.status(200).json({ status: 'success', payload: services });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Obtener un servicio por id
app.get('/api/services/:sid', async (req, res) => {
    try {
        const service = await manager.getServiceById(req.params.sid);
        if (!service) {
            return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
        }
        res.status(200).json({ status: 'success', payload: service });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Crear un id de servicio
app.post('/api/services', async (req, res) => {
    try {
        const result = await manager.addService(req.body);
        if (result.status === 'error') {
            return res.status(400).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Actualizar un id de servicio
app.put('/api/services/:sid', async (req, res) => {
    try {
        const result = await manager.updateService(req.params.sid, req.body);
        if (result.status === 'error') {
            return res.status(404).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Eliminar un servicio
app.delete('/api/services/:sid', async (req, res) => {
    try {
        const deletedService = await manager.deleteService(req.params.sid);
        if (!deletedService) {
            return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
        }
        res.status(200).json({ status: 'success', payload: deletedService });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
