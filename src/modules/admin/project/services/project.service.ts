import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

// Define the image interface
export interface ProjectImage {
  url: string;
  publicId: string;
  fileName: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createData: {
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate?: string;
    status: ProjectStatus;
    images: ProjectImage[];
  }): Promise<Project> {
    const project = this.projectRepository.create({
      title: createData.title,
      description: createData.description,
      location: createData.location,
      startDate: createData.startDate,
      endDate: createData.endDate,
      status: createData.status,
      images: createData.images || [],
    });

    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find();
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(
    id: number,
    updateData: {
      title?: string;
      description?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      status?: ProjectStatus;
      images?: ProjectImage[];
    },
  ): Promise<Project> {
    const project = await this.findOne(id);

    // Update only provided fields
    if (updateData.title !== undefined) project.title = updateData.title;
    if (updateData.description !== undefined)
      project.description = updateData.description;
    if (updateData.location !== undefined)
      project.location = updateData.location;
    if (updateData.startDate !== undefined)
      project.startDate = updateData.startDate;
    if (updateData.endDate !== undefined) project.endDate = updateData.endDate;
    if (updateData.status !== undefined) project.status = updateData.status;
    if (updateData.images !== undefined) project.images = updateData.images;

    return await this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async removeImage(
    projectId: number,
    imagePublicId: string,
  ): Promise<Project> {
    const project = await this.findOne(projectId);
    project.images = project.images.filter(
      (img) => img.publicId !== imagePublicId,
    );
    return await this.projectRepository.save(project);
  }
}
