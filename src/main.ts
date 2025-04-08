import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    httpOnly: false,
    sameOrigin: false,
    credentials: true,
  });

  // Configure WebSocket adapter
   app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(process.env.SERVER_PORT || 3050);
  console.log(`✅ Server is running on port ${process.env.SERVER_PORT || 3050}`);
}
bootstrap();
