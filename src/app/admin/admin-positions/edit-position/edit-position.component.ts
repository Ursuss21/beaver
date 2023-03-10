import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { ToastState } from '../../../shared/enum/toast-state';
import { Position } from '../../models/position.model';
import { PositionsService } from '../../services/positions.service';
import { first, Subject } from 'rxjs';
import { ErrorComponent } from '../../../shared/components/error/error.component';
import { Regex } from '../../../shared/helpers/regex.helper';

@Component({
  selector: 'bvr-edit-position',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    ErrorComponent,
    FormFieldComponent,
    ModalComponent,
    ReactiveFormsModule,
    RouterLinkWithHref,
    ToastComponent,
  ],
  templateUrl: './edit-position.component.html',
})
export class EditPositionComponent implements OnInit {
  controls!: any;
  editPositionForm!: FormGroup;
  isArchiveModalOpen: boolean = false;
  isCancelModalOpen: boolean = false;
  isFromGuard: boolean = false;
  isGuardDisabled: boolean = false;
  isSaveModalOpen: boolean = false;
  modalDescription: string = '';
  position!: Position;
  redirectSubject: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private positionsService: PositionsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getFormControls();
    this.getPosition();
  }

  createForm(): void {
    this.editPositionForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(Regex.ALPHANUMERIC)]],
      description: ['', [Validators.required]],
    });
  }

  getFormControls(): void {
    this.controls = {
      name: this.editPositionForm.get(['name']),
      description: this.editPositionForm.get(['description']),
    };
  }

  getPosition(): void {
    const positionId = this.route.snapshot.paramMap.get('id');
    if (positionId) {
      this.positionsService
        .getPosition(positionId)
        .pipe(first())
        .subscribe(position => {
          this.position = position;
          this.updateFormFields();
        });
    }
  }

  updateFormFields(): void {
    Object.keys(this.editPositionForm.controls).forEach(field => {
      this.editPositionForm
        .get(field)
        ?.setValue(this.position[field as keyof Position]);
    });
  }

  openArchiveModal(): void {
    this.isArchiveModalOpen = true;
    const positionName = this.controls.name?.value;
    this.modalDescription = `Are you sure you want to archive position ${positionName}? This action cannot be undone.`;
  }

  openCancelModal(fromGuard: boolean): void {
    this.isCancelModalOpen = true;
    this.isFromGuard = fromGuard;
    this.modalDescription = `Are you sure you want to leave? You will lose your unsaved changes if you continue.`;
  }

  openSaveModal(): void {
    if (this.editPositionForm.valid) {
      this.isSaveModalOpen = true;
      this.modalDescription = `Are you sure you want to save changes?`;
    } else {
      this.editPositionForm.markAllAsTouched();
      this.toastService.showToast(ToastState.Error, 'Form invalid');
      setTimeout(() => this.toastService.dismissToast(), 3000);
    }
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

  save(value: boolean): void {
    this.disableGuard(true);
    if (value) {
      this.positionsService
        .updatePosition(this.getPositionData())
        .pipe(first())
        .subscribe(() => {
          this.redirectBack();
        });
    }
  }

  getPositionData(): Position {
    return {
      id: this.position.id,
      name: this.editPositionForm.value.name,
      description: this.editPositionForm.value.description,
      count: this.position.count,
      creationDate: this.position.creationDate,
      active: this.position.active,
    };
  }

  redirectBack(): void {
    new Promise((resolve, _) => {
      this.location.back();
      resolve('done');
    }).then(() => {
      setTimeout(
        () =>
          this.toastService.showToast(ToastState.Success, 'Position edited'),
        200
      );
      setTimeout(() => this.toastService.dismissToast(), 3200);
    });
  }

  archive(value: boolean): void {
    this.disableGuard(true);
    if (value) {
      this.positionsService
        .archivePosition(this.position)
        .pipe(first())
        .subscribe(() => {
          this.router
            .navigate(['../..'], { relativeTo: this.route })
            .then(() => {
              setTimeout(
                () =>
                  this.toastService.showToast(
                    ToastState.Info,
                    'Position archived'
                  ),
                200
              );
              setTimeout(() => this.toastService.dismissToast(), 3200);
            });
        });
    }
  }

  disableGuard(value: boolean): void {
    this.isGuardDisabled = true;
    this.redirectSubject.next(value);
  }

  isRequired(control: AbstractControl): boolean {
    return control?.hasValidator(Validators.required) ? true : false;
  }
}
