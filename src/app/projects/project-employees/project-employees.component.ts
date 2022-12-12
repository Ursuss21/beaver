import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Employee } from '../../shared/model/employee.model';
import { ProjectEmployee } from '../model/project-employee.model';
import { ProjectEmployeesService } from '../services/project-employees.service';

@Component({
  selector: 'bvr-project-employees',
  templateUrl: './project-employees.component.html',
  standalone: true,
  imports: [
    ButtonComponent,
    CdkTableModule,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
})
export class ProjectEmployeesComponent implements OnInit {
  dataSource: ProjectEmployee[] = [];
  displayedActiveColumns: string[] = [
    'person',
    'position',
    'employmentStatus',
    'joinDate',
    'actions',
  ];
  displayedArchivedColumns: string[] = [
    'person',
    'position',
    'joinDate',
    'exitDate',
  ];
  query: string = '';
  showActive: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private projectEmployeesService: ProjectEmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataSource = this.projectEmployeesService.getProjectEmployees();
  }

  editEmployee(event: Event, row: Employee): void {
    event.stopPropagation();
    this.router.navigate([row.id, 'edit'], { relativeTo: this.route });
  }

  showEmployeeDetails(row: Employee): void {
    this.router.navigate([row.id], { relativeTo: this.route });
  }

  showActiveTable(value: boolean): void {
    if (value) {
      this.dataSource = this.projectEmployeesService.getProjectEmployees();
    } else {
      this.dataSource =
        this.projectEmployeesService.getArchivedProjectEmployees();
    }
  }
}
