import { Controller, Get, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private connection: Connection, // Add this line
  ) {}

  // @Get('/')
  // @Render('admin/dashboard')
  // dashboard() {
  //   return {
  //     title: 'Dashboard',
  //   };
  // }

  @Get('/health')
  health() {
    return { status: 'ok', message: 'Server is running' };
  }

  // NEW: Database setup endpoint - ADD THIS
  @Get('setup-database')
  async setupDatabase(@Res() res) {
    try {
      console.log('🟢 Starting database setup...');
      
      // Step 1: Create all tables
      console.log('📋 Creating all tables...');
      await this.connection.synchronize();
      console.log('✅ Tables created successfully!');
      
      // Step 2: Create admin user
      console.log('👤 Creating admin user...');
      const userRepository = this.connection.getRepository('User');
      
      // Check if admin already exists
      const adminExists = await userRepository.findOne({ 
        where: { email: 'admin@example.com' } 
      });
      
      let adminCreated = false;
      
      if (!adminExists) {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Create admin user
        const adminUser = userRepository.create({
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          isActive: true,
        });
        
        await userRepository.save(adminUser);
        adminCreated = true;
        console.log('✅ Admin user created!');
      } else {
        console.log('ℹ️ Admin user already exists');
      }
      
      // Step 3: Get list of all tables
      const tables = await this.connection.query(`
        SELECT tablename FROM pg_tables WHERE schemaname='public'
      `);
      
      // Step 4: Show success message
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Database Setup Complete</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #28a745; }
            .success { color: #28a745; }
            .info { color: #007bff; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .credentials {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              background: #28a745;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Database Setup Complete!</h1>
            
            <div class="credentials">
              <h3>🔐 Login Credentials</h3>
              <p><strong>Email:</strong> admin@example.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            
            <h3>📊 Tables Created:</h3>
            <table>
              <tr>
                <th>Table Name</th>
                <th>Status</th>
              </tr>
              ${tables.map(table => `
                <tr>
                  <td>${table.tablename}</td>
                  <td class="success">✓ Created</td>
                </tr>
              `).join('')}
            </table>
            
            <h3>👤 Admin User:</h3>
            <p class="info">${adminCreated ? '✓ New admin user created' : 'ℹ️ Admin user already existed'}</p>
            
            <a href="/admin/login" class="btn">Click Here to Login →</a>
          </div>
        </body>
        </html>
      `);
      
    } catch (error) {
      console.error('❌ Error:', error);
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
            .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>❌ Error Setting Up Database</h2>
            <p>${error.message}</p>
            <p>Check Railway logs for more details.</p>
          </div>
        </body>
        </html>
      `);
    }
  }
}