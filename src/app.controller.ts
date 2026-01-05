import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  index(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'src', 'frontend', 'index.html')
    );
  }
}
