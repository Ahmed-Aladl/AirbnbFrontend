import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step3-4-1-pricing',
  imports: [CommonModule],
  templateUrl: './step3-4-1-pricing.html',
  styleUrl: './step3-4-1-pricing.css'
})
export class Step341Pricing implements OnInit, OnDestroy {
  private subscription!: Subscription;
  price: number = 35;
  maxLength: number = 4;
  guestFeePercent: number = 0.14;
  hostFeePercent: number = 0.03;
  view: 'guest' | 'host' = 'guest';
  isBreakdownVisible: boolean = false;

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit() {
    // Load saved data
    const savedData = this.formStorage.getStepData('step3-4-1');
    if (savedData?.price) {
      this.price = savedData.price;
    }

    // Subscribe to next step event
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveFormData();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private saveFormData(): void {
    const data = {
      price: this.price
    };
    this.formStorage.saveFormData('step3-4-1', data);
  }

  get guestServiceFee(): number {
    return Math.round(this.price * this.guestFeePercent);
  }

  get guestTotal(): number {
    return this.price + this.guestServiceFee;
  }

  get hostServiceFee(): number {
    return Math.round(this.price * this.hostFeePercent);
  }

  get hostTotal(): number {
    return this.price - this.hostServiceFee;
  }

  onPriceInput(event: Event) {
    const input = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    let value = parseInt(input, 10) || 0;
    if (value > 9999) value = 9999;
    this.price = value;
    this.saveFormData();
  }

  toggleView() {
    if (!this.isBreakdownVisible) {
      // When opening the table
      this.isBreakdownVisible = true;
      this.view = 'host'; // Switch to host view when opening
    } else {
      // When closing the table, just hide it
      this.isBreakdownVisible = false;
      this.view = 'guest'; // Reset to guest view when closing
    }
  }
}
