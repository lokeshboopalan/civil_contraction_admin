import { ConfigFactory } from '@nestjs/config';

const configuration: ConfigFactory = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'NestJs@123',
    name: process.env.DB_NAME ?? 'constraction_management',
  },

  jwtSecret: process.env.JWT_SECRET ?? 'supersecret',
});

export default configuration;
