import { Injectable } from '@nestjs/common';

export interface Department {
  id: number;
  name: string;
  extensionNumber: string;
}

@Injectable()
export class DepartmentService {
  private departments: Department[] = [
    { id: 1, name: 'Sales', extensionNumber: '1' },
    { id: 2, name: 'Support', extensionNumber: '2' },
    { id: 3, name: 'Billing', extensionNumber: '3' },
  ];

  findAll(): Department[] {
    return this.departments;
  }

  findById(id: number): Department | undefined {
    return this.departments.find(d => d.id === id);
  }

  findByExtension(extension: string): Department | undefined {
    return this.departments.find(d => d.extensionNumber === extension);
  }
}
