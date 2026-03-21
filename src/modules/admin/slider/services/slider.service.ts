import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slider } from '../entities/slider.entity';
import { CreateSliderDto } from '../dto/create-slider.dto';
import { UpdateSliderDto } from '../dto/update-slider.dto';
import { SliderImage } from '../interfaces/slider-image.interface';
import { CreateSliderInput } from '../interfaces/create-slider-input.interface';

@Injectable()
export class SliderService {
  constructor(
    @InjectRepository(Slider)
    private sliderRepository: Repository<Slider>,
  ) {}

  // Use the interface instead of mixing with DTO
  async create(createSliderDto: CreateSliderDto): Promise<Slider> {
    const slider = this.sliderRepository.create({
      title: createSliderDto.title,
      subTitle: createSliderDto.subTitle,
      description: createSliderDto.description,
      order: createSliderDto.order || 0,
      isActive: createSliderDto.isActive ?? true,
      images: createSliderDto.images || [],
    });

    return await this.sliderRepository.save(slider);
  }

  async findAll(): Promise<Slider[]> {
    return await this.sliderRepository.find({
      order: {
        order: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Slider> {
    const slider = await this.sliderRepository.findOne({ where: { id } });
    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }
    return slider;
  }

  async update(
    id: number,
    updateData: UpdateSliderDto & { images?: SliderImage[] },
  ): Promise<Slider> {
    const slider = await this.findOne(id);

    if (updateData.title !== undefined) slider.title = updateData.title;
    if (updateData.subTitle !== undefined)
      slider.subTitle = updateData.subTitle;
    if (updateData.description !== undefined)
      slider.description = updateData.description;
    if (updateData.order !== undefined) slider.order = updateData.order;
    if (updateData.isActive !== undefined)
      slider.isActive = updateData.isActive;
    if (updateData.images !== undefined) slider.images = updateData.images;

    return await this.sliderRepository.save(slider);
  }

  async remove(id: number): Promise<void> {
    const slider = await this.findOne(id);
    await this.sliderRepository.remove(slider);
  }

  async removeImage(sliderId: number, imagePublicId: string): Promise<Slider> {
    const slider = await this.findOne(sliderId);
    slider.images = slider.images.filter(
      (img) => img.publicId !== imagePublicId,
    );
    return await this.sliderRepository.save(slider);
  }
}
