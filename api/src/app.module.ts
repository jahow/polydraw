import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import configuration from './configuration';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  logger = new Logger(AppModule.name);

  constructor(private config: ConfigService) {}

  onApplicationBootstrap() {
    this.logger.log(`\x1b[37mOpen http://localhost:${this.config.get('PORT')}`);
  }
}
