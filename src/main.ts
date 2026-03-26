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

  // Get the router from the server
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

  // Get the current working directory
  const cwd = process.cwd();
  console.log('Current working directory:', cwd);

  // Your public files are in src/public
  const publicPath = join(__dirname, '..', 'src', 'public');
  console.log('Public directory path:', publicPath);

  // Check if public directory exists
  if (fs.existsSync(publicPath)) {
    console.log('Public directory exists');
    console.log('Contents:', fs.readdirSync(publicPath));

    // Serve static files from src/public
    app.useStaticAssets(publicPath, {
      prefix: '/', // This makes files accessible from root URL
    });
  } else {
    console.log('Public directory does not exist at:', publicPath);

    // Try alternative path (maybe files are in public at root)
    const altPublicPath = join(__dirname, '..', 'public');
    console.log('Trying alternative path:', altPublicPath);

    if (fs.existsSync(altPublicPath)) {
      console.log('Found public at alternative path');
      app.useStaticAssets(altPublicPath, {
        prefix: '/',
      });
    } else {
      console.log('No public directory found anywhere!');
    }
  }

  // Set up views
  const viewsPath = join(__dirname, '..', 'views');
  console.log(
    `Views directory path: ${viewsPath} - ${fs.existsSync(viewsPath) ? 'EXISTS' : 'NOT FOUND'}`,
  );

  if (fs.existsSync(viewsPath)) {
    app.setBaseViewsDir(viewsPath);
    app.setViewEngine('ejs');
  } else {
    console.log('Views directory not found!');
  }

  await app.listen(3000);

  // Log routes after app is ready
  setTimeout(() => {
    logRoutes(app);
  }, 1000); // Wait 1 second for routes to be registered

  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Admin dashboard: http://localhost:3000/admin/dashboard`);
}
bootstrap();
