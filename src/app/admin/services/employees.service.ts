import { Injectable } from '@angular/core';
import { Employee } from '../../shared/model/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private _employees: Employee[] = [
    {
      id: '0',
      name: 'Robert',
      surname: 'Skrzypczak',
      position: 'Frontend Developer',
      employmentDate: new Date(2021, 8, 15),
      active: true,
    },
    {
      id: '1',
      name: 'Beata',
      surname: 'Iwan',
      position: 'Product Designer',
      employmentDate: new Date(2022, 7, 1),
      active: true,
    },
  ];

  constructor() {}

  getEmployees(): Employee[] {
    return this._employees;
  }
}