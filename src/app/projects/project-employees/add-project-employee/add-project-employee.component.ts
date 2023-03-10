import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate, Location } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { EmployeesService } from '../../../admin/services/employees.service';
import { first, Subject } from 'rxjs';
import { Employee } from '../../../shared/models/employee.model';
import { ToastState } from '../../../shared/enum/toast-state';
import { ToastService } from '../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { SwitchComponent } from '../../../shared/components/switch/switch.component';
import { DropdownSearchEmployeeComponent } from '../../../shared/components/dropdown-search-employee/dropdown-search-employee.component';
import { Account } from '../../../shared/models/account.model';
import { CustomValidators } from '../../../shared/helpers/custom-validators.helper';
import { ErrorComponent } from '../../../shared/components/error/error.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { ProjectEmployee } from '../../models/project-employee.model';
import { ProjectEmployeesService } from '../../services/project-employees.service';

@Component({
  selector: 'bvr-add-project-employee',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    DropdownSearchEmployeeComponent,
    ErrorComponent,
    FormFieldComponent,
    InputNumberComponent,
    ModalComponent,
    ReactiveFormsModule,
    SwitchComponent,
    ToastComponent,
  ],
  templateUrl: './add-project-employee.component.html',
})
export class AddProjectEmployeeComponent implements OnInit {
  addProjectEmployeeForm!: FormGroup;
  controls: any = {};
  employee!: Account;
  employees: Employee[] = [];
  isAddModalOpen: boolean = false;
  isCancelModalOpen: boolean = false;
  isFromGuard: boolean = false;
  isGuardDisabled: boolean = false;
  modalDescription: string = '';
  redirectSubject: Subject<boolean> = new Subject<boolean>();

  constructor(
    private employeesService: EmployeesService,
    private fb: FormBuilder,
    private location: Location,
    private projectEmployeesService: ProjectEmployeesService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getFormControls();
    this.getEmployees();
  }

  createForm(): void {
    this.addProjectEmployeeForm = this.fb.group({
      id: ['', [Validators.required]],
      workingTime: [
        '',
        [
          Validators.required,
          CustomValidators.minValue(0),
          CustomValidators.maxValue(168),
        ],
      ],
      salaryModifier: [
        { value: 100, disabled: true },
        [CustomValidators.minValue(0), CustomValidators.maxValue(500)],
      ],
    });
  }

  getFormControls(): void {
    Object.keys(this.addProjectEmployeeForm.controls).forEach(control => {
      this.controls[control] = this.addProjectEmployeeForm.get([control]);
    });
  }

  getEmployees(): void {
    this.employeesService
      .getEmployees()
      .pipe(first())
      .subscribe(employees => {
        this.employees = employees.slice(0, 7);
        setTimeout(() => this.observeIdSelection(), 0);
      });
  }

  observeIdSelection(): void {
    this.controls.id?.valueChanges.subscribe(() => {
      this.getEmployee();
    });
  }

  getEmployee(): void {
    const employeeId = this.controls.id?.value.id;
    this.employeesService
      .getEmployee(employeeId)
      .pipe(first())
      .subscribe(employee => (this.employee = employee));
  }

  openAddModal(): void {
    if (this.addProjectEmployeeForm.valid) {
      this.isAddModalOpen = true;
      this.modalDescription = `Are you sure you want to add ${this.employee.firstName} ${this.employee.lastName} to the Project X?`;
    } else {
      this.addProjectEmployeeForm.markAllAsTouched();
      this.toastService.showToast(ToastState.Error, 'Form invalid');
      setTimeout(() => this.toastService.dismissToast(), 3000);
    }
  }

  openCancelModal(fromGuard: boolean): void {
    this.isCancelModalOpen = true;
    this.isFromGuard = fromGuard;
    this.modalDescription = `Are you sure you want to leave? You will lose your unsaved changes if you continue.`;
  }

  add(value: boolean): void {
    this.disableGuard(true);
    if (value) {
      this.projectEmployeesService
        .addProjectEmployee(this.getProjectEmployeeData())
        .pipe(first())
        .subscribe(() => {
          this.router.navigate(['..'], { relativeTo: this.route }).then(() => {
            setTimeout(
              () =>
                this.toastService.showToast(
                  ToastState.Success,
                  'Employee added'
                ),
              200
            );
            setTimeout(() => this.toastService.dismissToast(), 3200);
          });
        });
    }
  }

  getProjectEmployeeData(): ProjectEmployee {
    const projectId = this.route.parent?.snapshot.paramMap.get('id') as string;
    return {
      id: '',
      projectId: projectId,
      employee: {
        id: this.employee.id,
        firstName: this.employee.firstName,
        lastName: this.employee.lastName,
        email: this.employee.email,
        image: this.employee.image,
        position: this.employee.position.name,
        employmentDate: this.employee.employmentDate,
        workingTime: this.employee.workingTime,
        wage: this.employee.wage,
        contractType: this.employee.contractType,
        active: this.employee.active,
      },
      workingTime: this.controls.workingTime?.value,
      salaryModifier: this.controls.salaryModifier?.value,
      joinDate: formatDate(new Date(Date.now()), 'yyyy-MM-dd', 'en'),
      active: true,
    };
  }

  cancel(value: boolean): void {
    if (this.isFromGuard) {
      this.redirectSubject.next(value);
    } else {
      this.disableGuard(value);
      if (value) {
        this.location.back();
      }
    }
  }

  disableGuard(value: boolean): void {
    this.isGuardDisabled = true;
    this.redirectSubject.next(value);
  }

  enableField(control: AbstractControl | null, value: boolean): void {
    value ? control?.enable() : control?.disable();
  }

  isRequired(control: AbstractControl): boolean {
    return control?.hasValidator(Validators.required) ? true : false;
  }
}
