import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FeatureProject,
  FeatureProjectStatus,
} from '../entities/feature-project.entity';
import { CreateFeatureProjectDto } from '../dto/create-feature-project.dto';
import { UpdateFeatureProjectDto } from '../dto/update-feature-project.dto';
import { FeatureProjectImage } from '../interfaces/feature-project-image.interface';
import { CreateFeatureProjectInput } from '../interfaces/create-feature-project-input.interface';

@Injectable()
export class FeatureProjectService {
  constructor(
    @InjectRepository(FeatureProject)
    private featureProjectRepository: Repository<FeatureProject>,
  ) {}

  async create(
    createInput: CreateFeatureProjectInput,
  ): Promise<FeatureProject> {
    const featureProject = new FeatureProject();

    featureProject.title = createInput.title;
    featureProject.description = createInput.description;
    featureProject.location = createInput.location;
    featureProject.startDate = createInput.startDate;
    featureProject.endDate = createInput.endDate || null;
    featureProject.status = createInput.status;
    featureProject.isActive = createInput.isActive ?? true;
    featureProject.sortOrder = createInput.sortOrder || 0;
    featureProject.images = createInput.images || [];

    return await this.featureProjectRepository.save(featureProject);
  }

  async findAll(): Promise<FeatureProject[]> {
    return await this.featureProjectRepository.find({
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActive(): Promise<FeatureProject[]> {
    return await this.featureProjectRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<FeatureProject> {
    const featureProject = await this.featureProjectRepository.findOne({
      where: { id },
    });
    if (!featureProject) {
      throw new NotFoundException(`Feature project with ID ${id} not found`);
    }
    return featureProject;
  }

  async update(
    id: number,
    updateData: UpdateFeatureProjectDto & { images?: FeatureProjectImage[] },
  ): Promise<FeatureProject> {
    const featureProject = await this.findOne(id);

    if (updateData.title !== undefined) featureProject.title = updateData.title;
    if (updateData.description !== undefined)
      featureProject.description = updateData.description;
    if (updateData.location !== undefined)
      featureProject.location = updateData.location;
    if (updateData.startDate !== undefined)
      featureProject.startDate = updateData.startDate;
    if (updateData.endDate !== undefined)
      featureProject.endDate = updateData.endDate || null;
    if (updateData.status !== undefined)
      featureProject.status = updateData.status;
    if (updateData.isActive !== undefined)
      featureProject.isActive = updateData.isActive;
    if (updateData.sortOrder !== undefined)
      featureProject.sortOrder = updateData.sortOrder;
    if (updateData.images !== undefined)
      featureProject.images = updateData.images;

    return await this.featureProjectRepository.save(featureProject);
  }

  async remove(id: number): Promise<void> {
    const featureProject = await this.findOne(id);
    await this.featureProjectRepository.remove(featureProject);
  }

  async removeImage(
    projectId: number,
    imagePublicId: string,
  ): Promise<FeatureProject> {
    const featureProject = await this.findOne(projectId);
    featureProject.images = featureProject.images.filter(
      (img) => img.publicId !== imagePublicId,
    );
    return await this.featureProjectRepository.save(featureProject);
  }

  async updateSortOrder(
    id: number,
    sortOrder: number,
  ): Promise<FeatureProject> {
    const featureProject = await this.findOne(id);
    featureProject.sortOrder = sortOrder;
    return await this.featureProjectRepository.save(featureProject);
  }

  async toggleActive(id: number): Promise<FeatureProject> {
    const featureProject = await this.findOne(id);
    featureProject.isActive = !featureProject.isActive;
    return await this.featureProjectRepository.save(featureProject);
  }
}
