import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../calendar/calendar.component';
import { ApprovalTrackerListComponent } from '../approval-tracker-list/approval-tracker-list.component';
import { TasksToRejectService } from '../../../shared/services/tasks-to-reject.service';
import { BehaviorSubject, first, Subject, Subscription } from 'rxjs';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ProjectEmployeesService } from '../../services/project-employees.service';
import { Employee } from '../../../shared/models/employee.model';
import { ToastState } from '../../../shared/enum/toast-state';
import { ToastService } from '../../../shared/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectEmployee } from '../../models/project-employee.model';
import { ProjectApprovalsService } from '../../services/project-approvals.service';
import { DropdownSearchEmployeeComponent } from '../../../shared/components/dropdown-search-employee/dropdown-search-employee.component';
import { EmployeeTasksService } from '../../../shared/services/employee-tasks.service';
import { Day } from '../../../calendar/models/day.model';

@Component({
  selector: 'bvr-approval-tracker',
  standalone: true,
  imports: [
    ApprovalTrackerListComponent,
    ButtonComponent,
    CalendarComponent,
    CommonModule,
    DropdownSearchEmployeeComponent,
    FormFieldComponent,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './approval-tracker.component.html',
})
export class ApprovalTrackerComponent implements OnInit, OnDestroy {
  $employeeCalendar: BehaviorSubject<Day[]> = new BehaviorSubject<Day[]>([]);
  approveTasksForm!: FormGroup;
  employees: Employee[] = [];
  isActive: boolean = true;
  isConfirmModalOpen: boolean = false;
  isFromGuard: boolean = false;
  isGuardDisabled: boolean = false;
  isResetModalOpen: boolean = false;
  modalDescription: string = '';
  projectEmployee!: ProjectEmployee;
  redirectSubject: Subject<boolean> = new Subject<boolean>();
  refreshTaskList: Subject<void> = new Subject<void>();

  private tasksToRejectSubscribtion: Subscription = new Subscription();

  constructor(
    private employeeTasksService: EmployeeTasksService,
    private fb: FormBuilder,
    private projectApprovalsService: ProjectApprovalsService,
    private projectEmployeesService: ProjectEmployeesService,
    private route: ActivatedRoute,
    private router: Router,
    private tasksToRejectService: TasksToRejectService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.observeRejectedTasks();
    this.createForm();
    this.getProjectEmployee();
  }

  observeRejectedTasks(): void {
    this.tasksToRejectSubscribtion =
      this.tasksToRejectService.tasksToReject.subscribe(tasks => {
        console.log(tasks);
      });
  }

  createForm(): void {
    this.approveTasksForm = this.fb.group({
      id: [''],
    });
  }

  getProjectEmployee(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    const projectApprovalId = this.route.snapshot.paramMap.get('id');
    if (projectId && projectApprovalId) {
      this.projectApprovalsService
        .getProjectApproval(projectId, projectApprovalId)
        .pipe(first())
        .subscribe(projectApproval => {
          this.projectEmployee = projectApproval.projectEmployee;
          this.updateFormFields();
          this.getEmployeeCalendar(this.projectEmployee.id);
          this.projectEmployee.active
            ? this.getProjectEmployees()
            : this.getArchivedProjectEmployees();
        });
    }
  }

  updateFormFields(): void {
    Object.keys(this.approveTasksForm.controls).forEach(field => {
      this.approveTasksForm.get(field)?.setValue(this.projectEmployee.employee);
    });
  }

  getEmployeeCalendar(employeeId: string): void {
    this.employeeTasksService
      .getEmployeeCalendar(employeeId)
      .pipe(first())
      .subscribe(calendar => {
        this.$employeeCalendar.next(calendar);
      });
  }

  getProjectEmployees(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (projectId) {
      this.projectEmployeesService
        .getProjectEmployees(projectId)
        .pipe(first())
        .subscribe(projectEmployees => {
          this.employees = projectEmployees.map(
            projectEmployee => projectEmployee.employee
          );
          this.isActive = true;
          this.observeIdSelection();
        });
    }
  }

  getArchivedProjectEmployees(): void {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (projectId) {
      this.projectEmployeesService
        .getArchivedProjectEmployees(projectId)
        .pipe(first())
        .subscribe(archivedProjectEmployees => {
          this.employees = archivedProjectEmployees.map(
            projectEmployee => projectEmployee.employee
          );
          this.isActive = false;
          this.observeIdSelection();
        });
    }
  }

  observeIdSelection(): void {
    this.approveTasksForm.get(['id'])?.valueChanges.subscribe(value => {
      this.router
        .navigate([`../${value}`], { relativeTo: this.route })
        .then(() => this.refreshTaskList.next());
    });
  }

  openCancelModal(fromGuard: boolean): void {
    this.isResetModalOpen = true;
    this.isFromGuard = fromGuard;
    this.modalDescription = `Are you sure you want to reset? You will lose your unsaved changes if you continue.`;
  }

  openConfirmModal(): void {
    this.isConfirmModalOpen = true;
    this.modalDescription = `Are you sure you want to approve X and reject Y tasks?`;
  }

  cancel(value: boolean): void {
    if (this.isFromGuard) {
      this.redirectSubject.next(value);
    } else {
      this.disableGuard(value);
      if (value) {
        this.router.navigate(['..'], { relativeTo: this.route });
      }
    }
  }

  confirm(): void {
    this.disableGuard(true);
    this.router.navigate(['..'], { relativeTo: this.route }).then(() => {
      setTimeout(
        () =>
          this.toastService.showToast(ToastState.Success, 'Approval resolved'),
        200
      );
      setTimeout(() => this.toastService.dismissToast(), 3200);
    });
  }

  disableGuard(value: boolean): void {
    this.isGuardDisabled = true;
    this.redirectSubject.next(value);
  }

  ngOnDestroy(): void {
    this.tasksToRejectSubscribtion.unsubscribe();
  }
}
