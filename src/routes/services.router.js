import { Router } from 'express';
import path from 'path';
import { validateService } from '../middlewares/validateService.middleware.js';

import ServiceManager from '../managers/ServiceManager.js';

const router = Router();
const databasePath = path.join(import.meta.dirname, '..', 'data', 'services.json');
const serviceManager = new ServiceManager(databasePath);

router.get('/', async (req, res) => {
    try {
        const { category, available } = req.query;
        const services = await serviceManager.getServices({ category, available });
        res.status(200).json({
            status: 'success',
            payload: services
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener los servicios'
        });
    }
});

router.get('/:sid', async (req, res) => {
    try {
        const service = await serviceManager.getServiceById(req.params.sid);
        if (!service) {
            return res.status(404).json({
                status: 'error',
                message: 'Servicio no encontrado'
            });
        }
        res.status(200).json({
            status: 'success',
            payload: service
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener el servicio'
        });
    }
});

router.post('/', validateService, async (req, res) => {
    try {
        const result = await serviceManager.addService(req.body);
        if (result.status === 'error') {
            return res.status(400).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al agregar el servicio'
        });
    }
});

router.put('/:sid', async (req, res) => {
    try {
        const result = await serviceManager.updateService(req.params.sid, req.body);
        if (result.status === 'error') {
            return res.status(404).json(result);
        }
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el servicio'
        });
    }
});

router.delete('/:sid', async (req, res) => {
    try {
        const deletedService = await serviceManager.deleteService(req.params.sid);
        if (!deletedService) {
            return res.status(404).json({
                status: 'error',
                message: 'Servicio no encontrado'
            });
        }
        res.status(200).json({
            status: 'success',
            payload: deletedService
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el servicio'
        });
    }
});



export default router;  