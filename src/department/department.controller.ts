import { Controller, Get, Param } from '@nestjs/common';
import { DepartmentService, Department } from './department.service';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  findAll(): Department[] {
    return this.departmentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Department | undefined {
    return this.departmentService.findById(Number(id));
  }

  @Get('extension/:extension')
  findByExtension(@Param('extension') extension: string): Department | undefined {
    return this.departmentService.findByExtension(extension);
  }
}
