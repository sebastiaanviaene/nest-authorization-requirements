import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Authorized } from './authorization/auth.guard';
import {
  adminRequirement,
  emailRequirement,
} from './authorization/requirements';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/or')
  @Authorized([[adminRequirement], [emailRequirement]])
  getOr(): string {
    return this.appService.getHello();
  }

  @Get('/and')
  @Authorized([[adminRequirement, emailRequirement]])
  getAnd(): string {
    return this.appService.getHello();
  }
}
