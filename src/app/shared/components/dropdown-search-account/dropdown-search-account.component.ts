import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Account } from '../../model/account.model';

@Component({
  selector: 'bvr-dropdown-search-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown-search-account.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DropdownSearchAccountComponent,
    },
  ],
})
export class DropdownSearchAccountComponent implements ControlValueAccessor {
  @Input() name: string = '';
  @Input() options: Account[] = [];

  disabled: boolean = false;
  query: string = '';
  selectEnabled: boolean = false;
  selectedOption!: Account;
  touched: boolean = false;

  selectOption(option: Account): void {
    this.markAsTouched();
    this.selectedOption = option;
    this.onChange(this.selectedOption.id);
    this.selectEnabled = false;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  writeValue(selectedOption: Account): void {
    this.selectedOption = selectedOption;
  }

  onChange = (selectedOptionId: string) => {};

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  onTouched = () => {};

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  onFocus(): void {
    this.selectEnabled = true;
  }

  onBlur(): void {
    this.selectEnabled = false;
  }
}
