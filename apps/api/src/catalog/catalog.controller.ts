import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/current-user.js';
import { RequirePermission } from '../common/permissions.guard.js';
import { CatalogService } from './catalog.service.js';

@Controller()
export class CatalogController {
  constructor(private catalog: CatalogService) {}
  @Get('catalog/products') @Public() products(@Query('q') query?: string) { return this.catalog.list(query?.slice(0, 80)); }
  @Get('catalog/products/:slug') @Public() product(@Param('slug') slug: string) { return this.catalog.bySlug(slug); }
  @Get('content/posts') @Public() posts() { return this.catalog.posts(); }
  @Get('content/posts/:slug') @Public() post(@Param('slug') slug: string) { return this.catalog.post(slug); }
  @Get('admin/overview') @RequirePermission('catalog', 'manage') overview() { return this.catalog.adminOverview(); }
}
