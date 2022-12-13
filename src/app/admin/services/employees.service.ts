import { Injectable } from '@angular/core';
import { Employee } from '../../shared/model/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private _employees: Employee[] = [
    {
      id: '0',
      firstName: 'Robert',
      lastName: 'Skrzypczak',
      email: 'robert.skrzypczak@gmail.com',
      image: 'assets/icons/icon14.png',
      position: 'Frontend Developer',
      employmentDate: '2021-08-15',
      workingTime: 40,
      active: true,
    },
    {
      id: '1',
      firstName: 'Beata',
      lastName: 'Iwan',
      email: 'beata.iwan@gmail.com',
      image: 'assets/icons/icon4.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      active: true,
    },
    {
      id: '2',
      firstName: 'Joanna',
      lastName: 'Malawska',
      email: 'joanna.malawska@gmail.com',
      image: 'assets/icons/icon8.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      active: true,
    },
    {
      id: '3',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@gmail.com',
      image: 'assets/icons/icon7.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      exitDate: '2022-09-01',
      active: false,
    },
    {
      id: '4',
      firstName: 'Paweł',
      lastName: 'Szymański',
      email: 'pawel.szymanski@gmail.com',
      image: 'assets/icons/icon19.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      active: true,
    },
    {
      id: '5',
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      email: 'maria.wisniewska@gmail.com',
      image: 'assets/icons/icon3.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      exitDate: '2022-09-01',
      active: false,
    },
    {
      id: '6',
      firstName: 'Jan',
      email: 'jan.kowalski@gmail.com',
      lastName: 'Kowalski',
      image: 'assets/icons/icon13.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      exitDate: '2022-09-01',
      active: false,
    },
    {
      id: '7',
      firstName: 'Emil',
      lastName: 'Zieliński',
      email: 'emil.zielinski@gmail.com',
      image: 'assets/icons/icon18.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      active: true,
    },
    {
      id: '8',
      firstName: 'Krystian',
      lastName: 'Kowalczyk',
      email: 'krystian.kowalczyk@gmail.com',
      image: 'assets/icons/icon16.png',
      position: 'Product Designer',
      employmentDate: '2022-07-01',
      workingTime: 40,
      active: true,
    },
  ];

  constructor() {}

  getEmployee(id: string): Employee {
    const employee = this._employees.find(employee => employee.id === id);
    return employee as Employee;
  }

  getEmployees(): Employee[] {
    return this._employees.filter(employee => employee.active);
  }

  getArchivedEmployees(): Employee[] {
    return this._employees.filter(employee => !employee.active);
  }
}
