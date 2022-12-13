import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from 'src/app/shared/components/form-field/form-field.component';
import { DropdownSearchEmployeeComponent } from '../dropdown-search-employee/dropdown-search-employee.component';
import { Employee } from '../../../shared/model/employee.model';
import { EmployeesService } from '../../../admin/services/employees.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../shared/services/toast.service';
import { ToastState } from '../../../shared/enum/toast-state';

@Component({
  selector: 'bvr-find-employee',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    DropdownSearchEmployeeComponent,
    FormFieldComponent,
    ModalComponent,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './find-employee.component.html',
})
export class FindEmployeeComponent implements OnInit {
  @Input() addProjectEmployeeForm!: FormGroup;

  @Output() nextStepChange: EventEmitter<void> = new EventEmitter();

  employees: Employee[] = [];
  isCancelModalOpen: boolean = false;
  modalDescription: string = '';

  constructor(
    private employeesService: EmployeesService,
    private location: Location,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.employees = this.employeesService.getEmployees().slice(0, 7);
    setTimeout(() => this.observeIdSelection(), 0);
  }

  observeIdSelection(): void {
    this.addProjectEmployeeForm
      .get(['userInfo', 'id'])
      ?.valueChanges.subscribe(() => {
        this.nextStepChange.emit();
      });
  }

  openCancelModal(): void {
    this.isCancelModalOpen = true;
    this.modalDescription = `Are you sure you want to leave? You will lose your unsaved changes if you continue.`;
  }

  cancel(): void {
    new Promise((resolve, _) => {
      this.location.back();
      resolve('done');
    }).then(() => {
      setTimeout(
        () => this.toastService.showToast(ToastState.Error, 'Error message'),
        200
      );
      setTimeout(() => this.toastService.dismissToast(), 3200);
    });
  }

  isRequired(name: string): boolean {
    return this.addProjectEmployeeForm
      .get(['userInfo', name])
      ?.hasValidator(Validators.required)
      ? true
      : false;
  }
}
