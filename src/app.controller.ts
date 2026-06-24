import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOkResponse({
    description: 'Confirma que a API está em execução.',
    schema: {
      example: {
        status: 'ok',
        service: 'backend-trail-lanchonete',
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
