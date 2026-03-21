import { SliderImage } from './slider-image.interface';

export interface CreateSliderInput {
  title: string;
  subTitle?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  images: SliderImage[];
}
