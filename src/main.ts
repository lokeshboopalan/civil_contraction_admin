import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

// Helper function to log routes safely
function logRoutes(app: INestApplication) {
  const server = app.getHttpServer();
  const router = (server as any)._events?.request?._router;

  if (router && router.stack) {
    let foundRoutes = false;
    router.stack.forEach((layer) => {
      if (layer.route) {
        foundRoutes = true;
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(', ');
        console.log(`${methods} ${layer.route.path}`);
      }
    });

    if (!foundRoutes) {
      console.log('No routes found');
    }
  } else {
    console.log('Router not available yet');
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use cookie parser
  app.use(cookieParser());
  app.use(methodOverride('_method'));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // ========== FIX STATIC FILE SERVING ==========

  // Method 1: Serve files from multiple possible locations
  const possiblePublicPaths = [
    join(__dirname, '..', 'src', 'public'), // /backendNestjs/src/public
    join(__dirname, 'public'), // /backendNestjs/src/public (if compiled)
    join(process.cwd(), 'src', 'public'), // Based on working directory
    join(process.cwd(), 'public'), // /backendNestjs/public
  ];

  let publicPathFound = false;

  for (const publicPath of possiblePublicPaths) {
    if (fs.existsSync(publicPath)) {
      console.log(`✓ Serving static files from: ${publicPath}`);
      console.log(`  Contents:`, fs.readdirSync(publicPath));

      // Serve static files with proper prefixes
      app.useStaticAssets(publicPath, {
        prefix: '/', // Serve from root: /css/style.css
      });

      // Also serve from /public prefix if needed
      app.useStaticAssets(publicPath, {
        prefix: '/public', // Also serve from /public/css/style.css
      });

      publicPathFound = true;
      break;
    }
  }

  if (!publicPathFound) {
    console.error('✗ No public directory found! Creating one...');
    const defaultPublicPath = join(process.cwd(), 'src', 'public');

    // Create default directories
    const directories = ['css', 'js', 'img', 'lib', 'webfonts'];
    directories.forEach((dir) => {
      const dirPath = join(defaultPublicPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${dirPath}`);
      }
    });

    app.useStaticAssets(defaultPublicPath, {
      prefix: '/',
    });
    console.log(`✓ Created and serving from: ${defaultPublicPath}`);
  }

  // ========== VIEW ENGINE SETUP ==========
  const possibleViewPaths = [
    join(__dirname, '..', 'views'), // /backendNestjs/views
    join(__dirname, 'views'), // /backendNestjs/src/views
    join(process.cwd(), 'views'), // Based on working directory
    join(process.cwd(), 'src', 'views'), // /backendNestjs/src/views
  ];

  let viewsPath: string | null = null;
  for (const path of possibleViewPaths) {
    if (fs.existsSync(path)) {
      viewsPath = path;
      console.log(`✓ Found views directory at: ${path}`);
      break;
    }
  }

  if (viewsPath) {
    app.setBaseViewsDir(viewsPath);
    app.setViewEngine('ejs');
    console.log(`✓ View engine configured with base directory: ${viewsPath}`);
  } else {
    console.error('✗ Views directory not found! Creating one...');
    const defaultViewPath = join(process.cwd(), 'views');

    if (!fs.existsSync(defaultViewPath)) {
      fs.mkdirSync(defaultViewPath, { recursive: true });
      fs.mkdirSync(join(defaultViewPath, 'admin'), { recursive: true });
      fs.mkdirSync(join(defaultViewPath, 'frontend'), { recursive: true });
      console.log(`✓ Created views directory at: ${defaultViewPath}`);
    }

    app.setBaseViewsDir(defaultViewPath);
    app.setViewEngine('ejs');
    console.log(
      `✓ View engine configured with base directory: ${defaultViewPath}`,
    );
  }

  // Log all static file paths for debugging
  console.log('\n=== Static File Serving Debug ===');
  console.log('Static files should be accessible at:');
  console.log('  - http://localhost:3000/css/style.css');
  console.log('  - http://localhost:3000/js/main.js');
  console.log('  - http://localhost:3000/img/logo.png');
  console.log('================================\n');

  await app.listen(3000);

  // Log routes after app is ready
  setTimeout(() => {
    logRoutes(app);
  }, 1000);

  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Admin dashboard: http://localhost:3000/admin/dashboard`);
}
bootstrap();
