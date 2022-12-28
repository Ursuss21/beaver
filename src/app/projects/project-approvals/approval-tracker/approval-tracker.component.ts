import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../calendar/calendar.component';
import { ApprovalTrackerListComponent } from '../approval-tracker-list/approval-tracker-list.component';
import { TasksToRejectService } from '../../../shared/services/tasks-to-reject.service';
import { first, Subscription } from 'rxjs';
import { DropdownSearchEmployeeComponent } from '../../project-employees/dropdown-search-employee/dropdown-search-employee.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ProjectEmployeesService } from '../../services/project-employees.service';
import { Employee } from '../../../shared/models/employee.model';
import { ToastState } from '../../../shared/enum/toast-state';
import { ToastService } from '../../../shared/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectEmployee } from '../../models/project-employee.model';
import { EmployeesApprovalsService } from '../../services/employees-approvals.service';

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
  approveTasksForm!: FormGroup;
  employees: Employee[] = [];
  isActive: boolean = true;
  isConfirmModalOpen: boolean = false;
  isResetModalOpen: boolean = false;
  modalDescription: string = '';
  projectEmployee: ProjectEmployee = {
    id: '',
    employee: {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      image: '',
      position: '',
      employmentDate: '',
      workingTime: 0,
      exitDate: '',
      active: false,
    },
    contractType: { id: '', name: '' },
    workingTime: 0,
    wage: 0,
    joinDate: '',
    exitDate: '',
    active: false,
  };

  private tasksToRejectSubscribtion: Subscription = new Subscription();

  constructor(
    private employeesApprovalsService: EmployeesApprovalsService,
    private fb: FormBuilder,
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
    const employeeApprovalId = this.route.snapshot.paramMap.get('id');
    if (employeeApprovalId) {
      this.employeesApprovalsService
        .getEmployeeApproval(employeeApprovalId)
        .pipe(first())
        .subscribe(employeeApproval => {
          this.projectEmployee = employeeApproval.projectEmployee;
          this.updateFormFields();
          console.log(this.projectEmployee);
          this.projectEmployee.active
            ? this.getProjectEmployees()
            : this.getArchivedProjectEmployees();
        });
    }
  }

  updateFormFields(): void {
    Object.keys(this.approveTasksForm.controls).forEach(field => {
      this.approveTasksForm
        .get(field)
        ?.setValue(this.projectEmployee.employee[field as keyof Employee]);
    });
  }

  getProjectEmployees(): void {
    this.projectEmployeesService
      .getProjectEmployees()
      .pipe(first())
      .subscribe(projectEmployees => {
        this.employees = projectEmployees.map(
          projectEmployee => projectEmployee.employee
        );
        this.isActive = true;
        this.observeIdSelection();
      });
  }

  getArchivedProjectEmployees(): void {
    this.projectEmployeesService
      .getArchivedProjectEmployees()
      .pipe(first())
      .subscribe(archivedProjectEmployees => {
        this.employees = archivedProjectEmployees.map(
          projectEmployee => projectEmployee.employee
        );
        this.isActive = false;
        this.observeIdSelection();
      });
  }

  observeIdSelection(): void {
    this.approveTasksForm.get(['id'])?.valueChanges.subscribe(value => {
      this.router.navigate([`../${value}`], { relativeTo: this.route });
    });
  }

  openCancelModal(): void {
    this.isResetModalOpen = true;
    this.modalDescription = `Are you sure you want to reset? You will lose your unsaved changes if you continue.`;
  }

  openConfirmModal(): void {
    this.isConfirmModalOpen = true;
    this.modalDescription = `Are you sure you want to approve X and reject Y tasks?`;
  }

  cancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  confirm(): void {
    this.router.navigate(['..'], { relativeTo: this.route }).then(() => {
      setTimeout(
        () =>
          this.toastService.showToast(ToastState.Success, 'Approval resolved'),
        200
      );
      setTimeout(() => this.toastService.dismissToast(), 3200);
    });
  }

  ngOnDestroy(): void {
    this.tasksToRejectSubscribtion.unsubscribe();
  }
}
