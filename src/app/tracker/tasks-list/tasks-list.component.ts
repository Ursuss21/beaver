import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeTasksService } from '../../shared/services/employee-tasks.service';
import { EmployeeTask } from '../../shared/models/employee-task.model';
import { EmployeeTasksComponent } from '../../shared/components/employee-tasks/employee-tasks.component';
import { EmployeeProjectTask } from '../../shared/models/employee-project-task.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/services/toast.service';
import { ToastState } from '../../shared/enum/toast-state';
import { first } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { CalendarService } from '../../shared/services/calendar.service';

@Component({
  selector: 'bvr-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeTasksComponent,
    ModalComponent,
    ToastComponent,
  ],
  templateUrl: './tasks-list.component.html',
})
export class TasksListComponent implements OnInit {
  employeeTasks: EmployeeTask[] = [];
  employeeProjectTasks: EmployeeProjectTask[] = [];
  isDeleteModalOpen: boolean = false;
  modalDescription: string = '';

  constructor(
    private authService: AuthService,
    private calendarService: CalendarService,
    private employeeTasksService: EmployeeTasksService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getEmployeeTasks();
    this.sortByProjectName();
  }

  getEmployeeTasks(): void {
    const employeeId = this.authService.getLoggedEmployeeId();
    if (employeeId) {
      this.calendarService.currentDay.subscribe(date => {
        this.employeeTasksService
          .getEmployeeTasks(employeeId, date)
          .pipe(first())
          .subscribe(employeeTasks => {
            this.employeeTasks = employeeTasks;
            this.getEmployeeProjectTasks();
          });
      });
    }
  }

  getEmployeeProjectTasks(): void {
    this.employeeProjectTasks = [];
    this.employeeTasks.forEach(employeeTask => {
      const index = this.findProjectIndex(employeeTask.project.id);
      if (index !== -1) {
        this.employeeProjectTasks[index].tasks.push(employeeTask);
      } else {
        this.employeeProjectTasks.push({
          project: employeeTask.project,
          tasks: [employeeTask],
        });
      }
    });
  }

  findProjectIndex(projectId: string) {
    return this.employeeProjectTasks.findIndex(
      employeeProjectTask => employeeProjectTask.project.id === projectId
    );
  }

  sortByProjectName(): void {
    this.employeeProjectTasks.sort((a, b) =>
      a.project.name.toLowerCase().localeCompare(b.project.name.toLowerCase())
    );
  }

  openDeleteModal(task: EmployeeTask): void {
    this.isDeleteModalOpen = true;
    this.modalDescription = `Are you sure you want to delete ${task.task.name}? This action cannot be undone.`;
  }

  editTask(task: EmployeeTask): void {
    this.router.navigate(['../edit-task', task.id], { relativeTo: this.route });
  }

  delete(): void {
    this.toastService.showToast(ToastState.Info, 'Task deleted');
    setTimeout(() => this.toastService.dismissToast(), 3000);
  }
}
