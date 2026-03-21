import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  About,
  SocialLink,
  TeamMember,
  Milestone,
} from '../entities/about.entity';
import { UpdateAboutDto } from '../dto/update-about.dto';
import { AboutImage } from '../interfaces/about-image.interface';
import {
  CreateAboutInput,
  TeamMemberInput,
  MilestoneInput,
} from '../interfaces/create-about-input.interface';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private aboutRepository: Repository<About>,
  ) {}

  async getAbout(): Promise<About> {
    const about = await this.aboutRepository.findOne({ where: {} });
    if (!about) {
      const defaultAbout = this.aboutRepository.create({
        title: 'About Us',
        isActive: true,
        images: [],
        socialLinks: [],
        teamMembers: [],
        milestones: [],
      });
      return await this.aboutRepository.save(defaultAbout);
    }
    return about;
  }

  async create(createInput: CreateAboutInput): Promise<About> {
    const about = new About();

    about.title = createInput.title;
    about.subtitle = createInput.subtitle ?? null;
    about.shortDescription = createInput.shortDescription ?? null;
    about.longDescription = createInput.longDescription ?? null;
    about.missionStatement = createInput.missionStatement ?? null;
    about.visionStatement = createInput.visionStatement ?? null;
    about.coreValues = createInput.coreValues ?? null;
    about.icon = createInput.icon ?? null;
    about.videoUrl = createInput.videoUrl ?? null;
    about.brochureUrl = createInput.brochureUrl ?? null;
    about.isActive = createInput.isActive ?? true;
    about.images = createInput.images || [];
    about.socialLinks = createInput.socialLinks || [];

    // Convert TeamMemberInput to TeamMember with defaults
    about.teamMembers = (createInput.teamMembers || []).map((member) => ({
      name: member.name,
      position: member.position,
      bio: member.bio ?? null,
      sortOrder: member.sortOrder ?? 0,
      image: member.image,
      socialLinks: member.socialLinks,
    }));

    // Convert MilestoneInput to Milestone with defaults
    about.milestones = (createInput.milestones || []).map((milestone) => ({
      year: milestone.year,
      title: milestone.title,
      description: milestone.description,
      icon: milestone.icon ?? null,
      sortOrder: milestone.sortOrder ?? 0,
    }));

    return await this.aboutRepository.save(about);
  }

  async update(
    id: number,
    updateData: UpdateAboutDto & { images?: AboutImage[] },
  ): Promise<About> {
    const about = await this.aboutRepository.findOne({ where: { id } });
    if (!about) {
      throw new NotFoundException(`About record with ID ${id} not found`);
    }

    // Update basic fields
    if (updateData.title !== undefined) about.title = updateData.title;
    if (updateData.subtitle !== undefined)
      about.subtitle = updateData.subtitle ?? null;
    if (updateData.shortDescription !== undefined)
      about.shortDescription = updateData.shortDescription ?? null;
    if (updateData.longDescription !== undefined)
      about.longDescription = updateData.longDescription ?? null;
    if (updateData.missionStatement !== undefined)
      about.missionStatement = updateData.missionStatement ?? null;
    if (updateData.visionStatement !== undefined)
      about.visionStatement = updateData.visionStatement ?? null;
    if (updateData.coreValues !== undefined)
      about.coreValues = updateData.coreValues ?? null;
    if (updateData.icon !== undefined) about.icon = updateData.icon ?? null;
    if (updateData.videoUrl !== undefined)
      about.videoUrl = updateData.videoUrl ?? null;
    if (updateData.brochureUrl !== undefined)
      about.brochureUrl = updateData.brochureUrl ?? null;
    if (updateData.isActive !== undefined) about.isActive = updateData.isActive;
    if (updateData.images !== undefined) about.images = updateData.images;

    // Update social links if provided
    if (updateData.socialLinks !== undefined) {
      about.socialLinks = updateData.socialLinks as SocialLink[];
    }

    // Update team members if provided - ensure required fields have defaults
    if (updateData.teamMembers !== undefined) {
      about.teamMembers = (updateData.teamMembers as any[]).map((member) => ({
        name: member.name,
        position: member.position,
        bio: member.bio ?? null,
        sortOrder: member.sortOrder ?? 0,
        image: member.image,
        socialLinks: member.socialLinks,
      }));
    }

    // Update milestones if provided - ensure required fields have defaults
    if (updateData.milestones !== undefined) {
      about.milestones = (updateData.milestones as any[]).map((milestone) => ({
        year: milestone.year,
        title: milestone.title,
        description: milestone.description,
        icon: milestone.icon ?? null,
        sortOrder: milestone.sortOrder ?? 0,
      }));
    }

    return await this.aboutRepository.save(about);
  }

  async removeImage(aboutId: number, imagePublicId: string): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.images = about.images.filter((img) => img.publicId !== imagePublicId);
    return await this.aboutRepository.save(about);
  }

  async addSocialLink(aboutId: number, socialLink: SocialLink): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.socialLinks = [...(about.socialLinks || []), socialLink];
    return await this.aboutRepository.save(about);
  }

  async removeSocialLink(aboutId: number, platform: string): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.socialLinks = about.socialLinks.filter(
      (link) => link.platform !== platform,
    );
    return await this.aboutRepository.save(about);
  }

  async addTeamMember(aboutId: number, teamMember: TeamMember): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.teamMembers = [...(about.teamMembers || []), teamMember];
    return await this.aboutRepository.save(about);
  }

  async updateTeamMember(
    aboutId: number,
    memberIndex: number,
    teamMember: Partial<TeamMember>,
  ): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    if (about.teamMembers && about.teamMembers[memberIndex]) {
      about.teamMembers[memberIndex] = {
        ...about.teamMembers[memberIndex],
        ...teamMember,
      };
    }
    return await this.aboutRepository.save(about);
  }

  async removeTeamMember(aboutId: number, memberIndex: number): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.teamMembers = about.teamMembers.filter(
      (_, index) => index !== memberIndex,
    );
    return await this.aboutRepository.save(about);
  }

  async addMilestone(aboutId: number, milestone: Milestone): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.milestones = [...(about.milestones || []), milestone];
    return await this.aboutRepository.save(about);
  }

  async removeMilestone(
    aboutId: number,
    milestoneIndex: number,
  ): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id: aboutId },
    });
    if (!about) {
      throw new NotFoundException(`About record with ID ${aboutId} not found`);
    }
    about.milestones = about.milestones.filter(
      (_, index) => index !== milestoneIndex,
    );
    return await this.aboutRepository.save(about);
  }
}
