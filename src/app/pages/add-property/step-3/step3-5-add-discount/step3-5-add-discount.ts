import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';

@Component({
  selector: 'app-step3-5-add-discount',
  imports: [CommonModule],
  templateUrl: './step3-5-add-discount.html',
  styleUrl: './step3-5-add-discount.css'
})
export class Step35AddDiscount implements OnInit, OnDestroy {
  private subscription: any;
  discounts = [
    {
      key: 'new',
      title: 'New listing promotion',
      description: 'Offer 20% off your first 3 bookings',
      percent: 20,
      enabled: true,
      editable: false
    },
    {
      key: 'weekly',
      title: 'Weekly discount',
      description: 'For stays of 7 nights or more',
      percent: 10,
      enabled: false,
      editable: true
    },
    {
      key: 'monthly',
      title: 'Monthly discount',
      description: 'For stays of 28 nights or more',
      percent: 20,
      enabled: false,
      editable: true
    }
  ];

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit() {
    this.loadFromStorage();
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveToStorage();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadFromStorage() {
    const savedData = this.formStorage.getStepData('step3-5');
    if (savedData && savedData.discounts) {
      // Merge saved data with default values to preserve structure
      this.discounts = this.discounts.map(discount => {
        const savedDiscount = savedData.discounts.find((d: any) => d.key === discount.key);
        return savedDiscount ? { ...discount, ...savedDiscount } : discount;
      });
    }
  }

  private saveToStorage() {
    this.formStorage.saveFormData('step3-5', {
      discounts: this.discounts
    });
  }

  toggleDiscount(idx: number) {
    this.discounts[idx].enabled = !this.discounts[idx].enabled;
    this.saveToStorage();
  }

  onPercentInput(idx: number, event: Event) {
    const input = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    let value = parseInt(input, 10) || 0;
    if (value > 99) value = 99;
    this.discounts[idx].percent = value;
    this.saveToStorage();
  }
}
