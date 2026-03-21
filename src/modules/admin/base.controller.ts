import { Req } from '@nestjs/common';

export class BaseController {
  protected getUserData(req: any) {
    console.log(req.user, 'slfdjjndgnjkgn');
    return req.user || null;
  }
}
