import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { ToastState } from '../../../shared/enum/toast-state';
import { Position } from '../../models/position.model';
import { PositionsService } from '../../services/positions.service';
import { first } from 'rxjs';

@Component({
  selector: 'bvr-edit-position',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    FormFieldComponent,
    ModalComponent,
    ReactiveFormsModule,
    RouterModule,
    ToastComponent,
  ],
  templateUrl: './edit-position.component.html',
})
export class EditPositionComponent implements OnInit {
  editPositionForm!: FormGroup;
  isArchiveModalOpen: boolean = false;
  isSaveModalOpen: boolean = false;
  isCancelModalOpen: boolean = false;
  modalDescription: string = '';
  position: Position = {
    id: '',
    name: '',
    description: '',
    creationDate: '',
    count: 0,
    archiveDate: '',
    active: true,
  };

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
    this.getPosition();
  }

  createForm(): void {
    this.editPositionForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
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
    const positionName = this.editPositionForm.get(['name'])?.value;
    this.modalDescription = `Are you sure you want to archive position ${positionName}? This action cannot be undone.`;
  }

  openCancelModal(): void {
    this.isCancelModalOpen = true;
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

  cancel(): void {
    this.location.back();
  }

  save(): void {
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

  archive(): void {
    this.router.navigate(['../..'], { relativeTo: this.route }).then(() => {
      setTimeout(
        () =>
          this.toastService.showToast(ToastState.Success, 'Position archived'),
        200
      );
      setTimeout(() => this.toastService.dismissToast(), 3200);
    });
  }

  isRequired(name: string): boolean {
    return this.editPositionForm.get(name)?.hasValidator(Validators.required)
      ? true
      : false;
  }

  showErrors(name?: string): boolean {
    if (name) {
      return !!(
        this.editPositionForm.get(name)?.invalid &&
        this.editPositionForm.get(name)?.errors &&
        (this.editPositionForm.get(name)?.dirty ||
          this.editPositionForm.get(name)?.touched)
      );
    } else {
      return !!(
        this.editPositionForm.invalid &&
        this.editPositionForm.errors &&
        (this.editPositionForm.dirty || this.editPositionForm.touched)
      );
    }
  }
}
