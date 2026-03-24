import { Controller, Get, Render, Param } from '@nestjs/common';
import { AboutService } from '../../admin/about/services/about.service';
import { ServiceService } from '../../admin/service/services/service.service';
import { ProjectsService } from '../../admin/project/services/project.service';
import { FeatureProjectService } from '../../admin/feature-project/services/feature-project.service';
import { SliderService } from '../../admin/slider/services/slider.service';
import { ArticleService } from '../../admin/article/services/article.service';

@Controller()
export class FrontendController {
  constructor(
    private aboutService: AboutService,
    private serviceService: ServiceService,
    private projectService: ProjectsService,
    private featureProjectService: FeatureProjectService,
    private sliderService: SliderService,
    private articleService: ArticleService,
  ) {
    console.log('FrontendController initialized');
  }

  @Get('/')
  @Render('user/home')
  async getHomePage() {
    console.log('Frontend homepage requested');
    try {
      const about = await this.aboutService.getAbout().catch(() => null);
      const services = await this.serviceService.findActive().catch(() => []);
      const featuredProjects = await this.featureProjectService
        .findActive()
        .catch(() => []);
      const sliders = await this.sliderService.findActive().catch(() => []);
      const latestArticles = await this.articleService
        .findPublished()
        .catch(() => []);
      const projects = await this.projectService.findAll().catch(() => []);

      console.log('=== FRONTEND DATA DEBUG ===');
      console.log('About:', about ? 'Yes' : 'No');
      console.log('Services count:', services?.length);
      console.log('Sliders count:', sliders?.length);
      console.log('Sliders data:', JSON.stringify(sliders, null, 2));
      console.log('Articles count:', latestArticles?.length);
      console.log('===========================');

      return {
        title: 'Thirupathi Constructions - Building Excellence',
        currentPage: 'home',
        about: about || {},
        services: services || [],
        featuredProjects: featuredProjects || [],
        sliders: sliders || [],
        latestArticles: latestArticles?.slice(0, 3) || [],
        projects: projects?.slice(0, 6) || [],
      };
    } catch (error) {
      console.error('Error loading homepage:', error);
      return {
        title: 'Thirupathi Constructions',
        currentPage: 'home',
        about: {},
        services: [],
        featuredProjects: [],
        sliders: [],
        latestArticles: [],
        projects: [],
      };
    }
  }

  @Get('/about')
  @Render('user/about')
  async getAboutPage() {
    console.log('About page requested');
    try {
      const about = await this.aboutService.getAbout().catch(() => null);
      return {
        title: 'About Us - Thirupathi Constructions',
        currentPage: 'about',
        about: about || {},
      };
    } catch (error) {
      console.error('Error loading about page:', error);
      return {
        title: 'About Us - Thirupathi Constructions',
        currentPage: 'about',
        about: {},
      };
    }
  }

  @Get('/services')
  @Render('user/services')
  async getServicesPage() {
    console.log('Services page requested');
    try {
      const services = await this.serviceService.findActive().catch(() => []);
      console.log(`Found ${services.length} active services`);
      return {
        title: 'Our Services - Thirupathi Constructions',
        currentPage: 'services',
        services: services || [],
      };
    } catch (error) {
      console.error('Error loading services page:', error);
      return {
        title: 'Our Services - Thirupathi Constructions',
        currentPage: 'services',
        services: [],
      };
    }
  }

  @Get('/services/:id')
  @Render('user/service-detail')
  async getServiceDetail(@Param('id') id: string) {
    console.log(`Service detail page requested for ID: ${id}`);
    try {
      const service = await this.serviceService.findOne(Number(id));
      return {
        title: `${service.title} - Thirupathi Constructions`,
        currentPage: 'services',
        service: service || {},
      };
    } catch (error) {
      return {
        title: 'Service Not Found',
        currentPage: 'services',
        service: {},
        error: 'Service not found',
      };
    }
  }

  @Get('/projects')
  @Render('user/projects')
  async getProjectsPage() {
    console.log('Projects page requested');
    try {
      const projects = await this.projectService.findAll().catch(() => []);
      console.log(`Found ${projects.length} projects`);
      return {
        title: 'Our Projects - Thirupathi Constructions',
        currentPage: 'projects',
        projects: projects || [],
      };
    } catch (error) {
      console.error('Error loading projects page:', error);
      return {
        title: 'Our Projects - Thirupathi Constructions',
        currentPage: 'projects',
        projects: [],
      };
    }
  }

  @Get('/projects/:id')
  @Render('user/project-detail')
  async getProjectDetail(@Param('id') id: string) {
    console.log(`Project detail page requested for ID: ${id}`);
    try {
      const project = await this.projectService.findOne(Number(id));
      return {
        title: `${project.title} - Thirupathi Constructions`,
        currentPage: 'projects',
        project: project || {},
      };
    } catch (error) {
      console.error('Error loading project detail:', error);
      return {
        title: 'Project Not Found',
        currentPage: 'projects',
        project: {},
        error: 'Project not found',
      };
    }
  }

  @Get('/articles')
  @Render('user/articles')
  async getArticlesPage() {
    console.log('Articles page requested');
    try {
      const articles = await this.articleService
        .findPublished()
        .catch(() => []);
      console.log(`Found ${articles.length} published articles`);
      return {
        title: 'Latest Articles - Thirupathi Constructions',
        currentPage: 'articles',
        articles: articles || [],
      };
    } catch (error) {
      console.error('Error loading articles page:', error);
      return {
        title: 'Latest Articles - Thirupathi Constructions',
        currentPage: 'articles',
        articles: [],
      };
    }
  }

  @Get('/articles/:id')
  @Render('user/article-detail')
  async getArticleDetail(@Param('id') id: string) {
    console.log(`Article detail page requested for ID: ${id}`);
    try {
      const article = await this.articleService.findOne(Number(id));
      // Increment view count
      await this.articleService.incrementViews(Number(id));

      // Get related articles (same role, exclude current)
      const allArticles = await this.articleService.findPublished();
      const relatedArticles = allArticles
        .filter((a) => a.id !== Number(id))
        .slice(0, 3);

      return {
        title: `${article.title} - Thirupathi Constructions`,
        currentPage: 'articles',
        article: article || {},
        relatedArticles: relatedArticles || [],
      };
    } catch (error) {
      console.error('Error loading article detail:', error);
      return {
        title: 'Article Not Found',
        currentPage: 'articles',
        article: {},
        relatedArticles: [],
        error: 'Article not found',
      };
    }
  }

  @Get('/contact')
  @Render('user/contact')
  async getContactPage() {
    // @Query('success') success?: string,
    // @Query('error') error?: string,
    console.log('Contact page requested');
    return {
      title: 'Contact Us - Thirupathi Constructions',
      currentPage: 'contact',
      //   success: success || null,
      //   error: error || null,
    };
  }

  // @Post('/contact/submit')
  // async submitContact(
  //   @Body() body: { name: string; email: string; phone?: string; subject: string; message: string },
  //   @Res() res: Response,
  // ) {
  //   try {
  //     console.log('Contact form submitted:', body);

  //     // Here you can:
  //     // 1. Save to database (if you create a Contact entity)
  //     // 2. Send email notification
  //     // 3. Store in file

  //     // For now, just log and redirect with success message
  //     return res.redirect('/contact?success=Message sent successfully! We will contact you soon.');

  //   } catch (error) {
  //     console.error('Error submitting contact form:', error);
  //     return res.redirect('/contact?error=' + encodeURIComponent('Failed to send message. Please try again.'));
  //   }
  // }
}
