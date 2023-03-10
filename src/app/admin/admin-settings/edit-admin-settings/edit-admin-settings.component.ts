import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { LinkOption } from '../../../shared/models/link-option.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { first, Subject } from 'rxjs';
import { GlobalSettingsService } from '../../services/global-settings.service';
import { GlobalSettings } from '../../models/global-settings.model';
import { ChildrenOutletContexts } from '@angular/router';
import { EditCompanySettingsComponent } from './edit-company-settings/edit-company-settings.component';
import { EditContactSettingsComponent } from './edit-contact-settings/edit-contact-settings.component';
import { EditGeneralSettingsComponent } from './edit-general-settings/edit-general-settings.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ToastState } from '../../../shared/enum/toast-state';
import { ToastService } from '../../../shared/services/toast.service';
import { tabAnimation } from '../../../shared/animations/tab.animation';
import { Regex } from '../../../shared/helpers/regex.helper';

@Component({
  selector: 'bvr-edit-admin-settings',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    EditCompanySettingsComponent,
    EditContactSettingsComponent,
    EditGeneralSettingsComponent,
    ModalComponent,
    ReactiveFormsModule,
    TabsComponent,
    ToastComponent,
  ],
  templateUrl: './edit-admin-settings.component.html',
  animations: [tabAnimation],
})
export class EditAdminSettingsComponent implements OnInit {
  controls: any = {};
  editGlobalSettingsForm!: FormGroup;
  enableFormButtons: boolean = true;
  globalSettings!: GlobalSettings;
  isCancelModalOpen: boolean = false;
  isFromGuard: boolean = false;
  isGuardDisabled: boolean = false;
  isSaveModalOpen: boolean = false;
  modalDescription: string = '';
  navbarOptions: LinkOption[] = [];
  redirectSubject: Subject<boolean> = new Subject<boolean>();
  tabIndex: number = 0;

  constructor(
    private contexts: ChildrenOutletContexts,
    private fb: FormBuilder,
    private globalSettingsService: GlobalSettingsService,
    private location: Location,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getCurrentTab();
    this.createForm();
    this.getFormControls();
    this.getNavbarOptions();
    this.getGlobalSettings();
  }

  getCurrentTab(): void {
    this.tabIndex =
      this.contexts.getContext('primary')?.route?.snapshot.data['tabs'];
  }

  createForm(): void {
    this.editGlobalSettingsForm = this.fb.group({
      generalInfo: this.fb.group({
        requireConfirmationOnTaskSubmission: [false],
        showDashboards: [false],
        showProjects: [false],
        defaultPage: [''],
      }),
      companyInfo: this.fb.group({
        companyName: [
          '',
          [Validators.required, Validators.pattern(Regex.ALPHANUMERIC)],
        ],
        regon: ['', [Validators.required, Validators.pattern(Regex.REGON)]],
        nip: ['', [Validators.required, Validators.pattern(Regex.NIP)]],
        krs: ['', [Validators.required, Validators.pattern(Regex.NIP)]],
        logo: [''],
        description: [''],
      }),
      contactInfo: this.fb.group({
        street: [
          '',
          [Validators.required, Validators.pattern(Regex.ALPHANUMERIC)],
        ],
        houseNumber: [
          '',
          [Validators.required, Validators.pattern(Regex.ALPHANUMERIC)],
        ],
        apartmentNumber: ['', [Validators.pattern(Regex.ALPHANUMERIC)]],
        city: ['', [Validators.required, Validators.pattern(Regex.ALPHA)]],
        postalCode: [
          '',
          [Validators.required, Validators.pattern(Regex.ALPHANUMERIC)],
        ],
        country: ['', [Validators.required]],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(Regex.PHONE)],
        ],
        email: ['', [Validators.required, Validators.pattern(Regex.EMAIL)]],
        website: ['', [Validators.required, Validators.pattern(Regex.WEBSITE)]],
      }),
    });
  }

  getFormControls(): void {
    Object.keys(this.editGlobalSettingsForm.controls).forEach(group => {
      this.controls[group] = this.editGlobalSettingsForm.get([group]);
      Object.keys(
        (this.editGlobalSettingsForm.get(group) as FormGroup<any>).controls
      ).forEach(field => {
        this.controls[field] = this.editGlobalSettingsForm.get([group, field]);
      });
    });
  }

  getNavbarOptions(): void {
    this.navbarOptions.push({ name: 'General', path: 'general' });
    this.navbarOptions.push({ name: 'Company Info', path: 'company' });
    this.navbarOptions.push({ name: 'Contact', path: 'contact' });
  }

  getGlobalSettings(): void {
    this.globalSettingsService
      .getGlobalSettings()
      .pipe(first())
      .subscribe(globalSettings => {
        this.globalSettings = globalSettings;
        this.updateFormFields();
      });
  }

  updateFormFields(): void {
    Object.keys(this.editGlobalSettingsForm.controls).forEach(group => {
      Object.keys(
        (this.editGlobalSettingsForm.get(group) as FormGroup<any>).controls
      ).forEach(field => {
        this.editGlobalSettingsForm
          .get([group, field])
          ?.setValue(this.globalSettings[field as keyof GlobalSettings]);
      });
    });
  }

  updateTabIndex(index: number): void {
    this.tabIndex = index;
  }

  openCancelModal(fromGuard: boolean): void {
    this.isCancelModalOpen = true;
    this.isFromGuard = fromGuard;
    this.modalDescription = `Are you sure you want to leave? You will lose your unsaved changes if you continue.`;
  }

  openSaveModal(): void {
    if (this.editGlobalSettingsForm.valid) {
      this.isSaveModalOpen = true;
      this.modalDescription = 'Are you sure you want to save changes?';
    } else {
      this.editGlobalSettingsForm.markAllAsTouched();
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
      this.globalSettingsService
        .updateGlobalSettings(this.getGlobalSettingsData())
        .pipe(first())
        .subscribe(() => {
          new Promise((resolve, _) => {
            this.location.back();
            resolve('done');
          }).then(() => {
            setTimeout(
              () =>
                this.toastService.showToast(
                  ToastState.Success,
                  'Global settings edited'
                ),
              200
            );
            setTimeout(() => this.toastService.dismissToast(), 3200);
          });
        });
    }
  }

  getGlobalSettingsData(): GlobalSettings {
    return {
      requireConfirmationOnTaskSubmission:
        this.controls.requireConfirmationOnTaskSubmission?.value,
      showDashboards: this.controls.showDashboards?.value,
      showProjects: this.controls.showProjects?.value,
      defaultPage: this.controls.defaultPage?.value,
      companyName: this.controls.companyName?.value,
      regon: this.controls.regon?.value,
      nip: this.controls.nip?.value,
      krs: this.controls.krs?.value,
      image: this.controls.image?.value,
      description: this.controls.description?.value,
      street: this.controls.street?.value,
      houseNumber: this.controls.houseNumber?.value,
      apartmentNumber: this.controls.apartmentNumber?.value,
      city: this.controls.city?.value,
      postalCode: this.controls.postalCode?.value,
      country: this.controls.country?.value,
      phoneNumber: this.controls.phoneNumber?.value,
      email: this.controls.email?.value,
      website: this.controls.website?.value,
    };
  }

  disableGuard(value: boolean): void {
    this.isGuardDisabled = true;
    this.redirectSubject.next(value);
  }

  toggleFormButtons(value: boolean): void {
    this.enableFormButtons = value;
  }
}
