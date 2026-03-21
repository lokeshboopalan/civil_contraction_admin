import { FeatureProjectStatus } from '../entities/feature-project.entity';
import { FeatureProjectImage } from './feature-project-image.interface';

export interface CreateFeatureProjectInput {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  status: FeatureProjectStatus;
  isActive?: boolean;
  sortOrder?: number;
  images: FeatureProjectImage[];
}
