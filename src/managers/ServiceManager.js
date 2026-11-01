import { readFile, writeFile } from 'fs/promises';

const REQUIRED_FIELDS = ['name', 'description', 'duration', 'price', 'category', 'available'];

export default class ServiceManager {
    constructor(databasePath) {
        this.databasePath = databasePath;
    }

    async #save(services) {
        await writeFile(this.databasePath, JSON.stringify(services, null, 2));
    }

    async getServices() {
        const data = await readFile(this.databasePath, 'utf-8');
        return JSON.parse(data);
    }

    async getServiceById(idService) {
        const services = await this.getServices();
        const service = services.find((service) => service.id === Number(idService));

        return service ?? null;
    }

    async addService(serviceData) {
        const missingFields = REQUIRED_FIELDS.filter(
            (field) => serviceData?.[field] === undefined || serviceData[field] === null || serviceData[field] === '',
        );

        if (missingFields.length > 0) {
            return {
                payload: null,
                status: 'error',
                message: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
            };
        }

        const services = await this.getServices();
        const lastId = services.length > 0 ? services[services.length - 1].id : 0;

        const { id, ...newServiceData } = serviceData;

        const newService = {
            id: lastId + 1,
            ...newServiceData,
        };

        services.push(newService);
        await this.#save(services);

        return {
            payload: newService,
            status: 'success',
        };
    }

    async updateService(idService, updatedServiceData) {
        const services = await this.getServices();

        const servicePosition = services.findIndex(
            (service) => service.id === Number(idService),
        );

        if (servicePosition === -1) {
            return {
                payload: null,
                status: 'error',
                message: 'Servicio no encontrado',
            };
        }

        const { id, ...dataToUpdate } = updatedServiceData;

        services[servicePosition] = {
            ...services[servicePosition],
            ...dataToUpdate,
            id: services[servicePosition].id,
        };

        await this.#save(services);

        return {
            payload: services[servicePosition],
            status: 'success',
        };
    }

    async deleteService(idService) {
        const services = await this.getServices();

        const servicePosition = services.findIndex(
            (service) => service.id === Number(idService),
        );

        if (servicePosition === -1) {
            return null;
        }

        const [deletedService] = services.splice(servicePosition, 1);
        await this.#save(services);

        return deletedService;
    }
}
