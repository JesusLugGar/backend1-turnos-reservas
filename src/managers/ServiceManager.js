import { readFile, writeFile } from "node:fs/promises";

export default class ServiceManager {
  constructor(databasePath) {
    this.databasePath = databasePath;
  }

  async #save(services) {
    await writeFile(this.databasePath, JSON.stringify(services, null, 2));
  }

  async getServices(filters = {}) {
    const data = await readFile(this.databasePath, "utf-8");
    let services = JSON.parse(data);

    if (filters.category) {
      services = services.filter(
        (service) => service.category.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    if (filters.available !== undefined) {
      const isAvailable = filters.available === "true";
      services = services.filter((service) => service.available === isAvailable);
    }

    return services;
  }

  async getServiceById(idService) {
    const services = await this.getServices();

    const service = services.find((service) => service.id === Number(idService));

    return service ?? null;
  }

  async addService(serviceData) {
    const services = await this.getServices();

    const id =
      services.length > 0
        ? Math.max(...services.map((service) => service.id)) + 1
        : 1;

    const newService = {
      ...serviceData,
      id,
    };

    services.push(newService);

    await this.#save(services);

    return {
      payload: newService,
      status: "success",
    };
  }

  async updateService(idService, updatedServiceData = {}) {
    const services = await this.getServices();

    const servicePosition = services.findIndex(
      (service) => service.id === Number(idService),
    );

    if (servicePosition === -1) {
      return {
        payload: null,
        status: "error",
        message: "Servicio no encontrado",
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
      status: "success",
    };
  }

  async deleteService(idService) {
    const services = await this.getServices();

    const serviceToDelete = services.find((service) => service.id === Number(idService));

    if (!serviceToDelete) {
      return null;
    }

    const filteredServices = services.filter((service) => service.id !== Number(idService));

    await this.#save(filteredServices);

    return serviceToDelete;
  }
}
