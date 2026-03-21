import { ServiceStatus } from '../entities/service.entity';
import { ServiceImage } from './service-image.interface';

export interface CreateServiceInput {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  icon?: string | null;
  link?: string | null;
  status?: ServiceStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  features?: string[];
  images: ServiceImage[];
}
