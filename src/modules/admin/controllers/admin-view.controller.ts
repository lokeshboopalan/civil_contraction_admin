import { Controller, Get, Render, UseGuards, Req } from '@nestjs/common';
// import { AdminAuthGuard } from '../guards/admin-auth.guard';
// import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WebAuthGuard } from '../auth/guards/web-auth.guard';
import { BaseController } from '../../admin/base.controller';

@Controller('admin')
// @UseGuards(AdminAuthGuard)
@UseGuards(WebAuthGuard)
export class AdminViewController extends BaseController {
  constructor() {
    super(); // required
  }

  @Get('dashboard')
  @Render('admin/dashboard')
  dashboard(@Req() req: any) {
    const data = {
      // user: { name: 'Admin User', role: 'Admin' },
      user: this.getUserData(req),
      stats: {
        todaySale: 1234,
        totalSale: 12345,
        todayRevenue: 567,
        totalRevenue: 6789,
      },
      recentSales: [
        {
          id: 1,
          date: '01 Jan 2045',
          invoice: 'INV-0123',
          customer: 'John Doe',
          amount: 123,
          status: 'Paid',
        },
        {
          id: 2,
          date: '01 Jan 2045',
          invoice: 'INV-0124',
          customer: 'Jane Smith',
          amount: 456,
          status: 'Pending',
        },
      ],
    };

    console.log('Dashboard data:', data);
    return data;
  }

  @Get('projects')
  @Render('admin/projects')
  projects(@Req() req: any) {
    const data = {
      // user: { name: 'Admin User', role: 'Admin' },
      user: this.getUserData(req),
      projects: [
        {
          id: 1,
          name: 'Project Alpha',
          description: 'Description of project alpha',
          progress: 75,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
        },
        {
          id: 2,
          name: 'Project Beta',
          description: 'Description of project beta',
          progress: 30,
          startDate: '2024-02-01',
          endDate: '2024-08-31',
        },
      ],
    };

    console.log('Projects data:', data);
    return data;
  }
}
