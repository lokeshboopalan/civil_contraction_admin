import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceStatus } from '../entities/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { ServiceImage } from '../interfaces/service-image.interface';
import { CreateServiceInput } from '../interfaces/create-service-input.interface';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createInput: CreateServiceInput): Promise<Service> {
    const service = new Service();

    // Required fields
    service.title = createInput.title;

    // Optional fields with proper null/undefined handling
    service.subtitle =
      createInput.subtitle !== undefined ? createInput.subtitle : null;
    service.description =
      createInput.description !== undefined ? createInput.description : null;
    service.shortDescription =
      createInput.shortDescription !== undefined
        ? createInput.shortDescription
        : null;
    service.icon = createInput.icon !== undefined ? createInput.icon : null;
    service.link = createInput.link !== undefined ? createInput.link : null;

    // Fields with defaults
    service.status = createInput.status || ServiceStatus.ACTIVE;
    service.isFeatured = createInput.isFeatured ?? true;
    service.sortOrder = createInput.sortOrder || 0;
    service.features = createInput.features || [];
    service.images = createInput.images || [];

    return await this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return await this.serviceRepository.find({
      order: {
        isFeatured: 'DESC',
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActive(): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { status: ServiceStatus.ACTIVE },
      order: {
        isFeatured: 'DESC',
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findFeatured(): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { isFeatured: true, status: ServiceStatus.ACTIVE },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(
    id: number,
    updateData: UpdateServiceDto & { images?: ServiceImage[] },
  ): Promise<Service> {
    const service = await this.findOne(id);

    // Update fields with proper null/undefined handling
    if (updateData.title !== undefined) service.title = updateData.title;
    if (updateData.subtitle !== undefined)
      service.subtitle =
        updateData.subtitle !== null ? updateData.subtitle : null;
    if (updateData.description !== undefined)
      service.description =
        updateData.description !== null ? updateData.description : null;
    if (updateData.shortDescription !== undefined)
      service.shortDescription =
        updateData.shortDescription !== null
          ? updateData.shortDescription
          : null;
    if (updateData.icon !== undefined)
      service.icon = updateData.icon !== null ? updateData.icon : null;
    if (updateData.link !== undefined)
      service.link = updateData.link !== null ? updateData.link : null;
    if (updateData.status !== undefined) service.status = updateData.status;
    if (updateData.isFeatured !== undefined)
      service.isFeatured = updateData.isFeatured;
    if (updateData.sortOrder !== undefined)
      service.sortOrder = updateData.sortOrder;
    if (updateData.features !== undefined)
      service.features = updateData.features;
    if (updateData.images !== undefined) service.images = updateData.images;

    return await this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  async removeImage(
    serviceId: number,
    imagePublicId: string,
  ): Promise<Service> {
    const service = await this.findOne(serviceId);
    service.images = service.images.filter(
      (img) => img.publicId !== imagePublicId,
    );
    return await this.serviceRepository.save(service);
  }

  async toggleFeatured(id: number): Promise<Service> {
    const service = await this.findOne(id);
    service.isFeatured = !service.isFeatured;
    return await this.serviceRepository.save(service);
  }

  async updateStatus(id: number, status: ServiceStatus): Promise<Service> {
    const service = await this.findOne(id);
    service.status = status;
    return await this.serviceRepository.save(service);
  }
}
