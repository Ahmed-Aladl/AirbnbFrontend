import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step3-2-pick-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step3-2-pick-booking.html',
  styleUrl: './step3-2-pick-booking.css'
})
export class Step32PickBooking implements OnInit, OnDestroy {
  private subscription!: Subscription;
  options = [
    {
      key: 'approve',
      title: 'Approve your first 5 bookings',
      description: 'Start by reviewing reservation requests, then switch to Instant Book, so guests can book automatically.',
      recommended: true,
      icon: 'approve'
    },
    {
      key: 'instant',
      title: 'Use Instant Book',
      description: 'Let guests book automatically.',
      recommended: false,
      icon: 'instant'
    }
  ];
  selected: string = 'approve';

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step3-2');
    if (savedData?.selected) {
      this.selected = savedData.selected;
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

  isSelected(key: string): boolean {
    return this.selected === key;
  }

  selectOption(key: string): void {
    this.selected = key;
    this.saveFormData();
  }

  private saveFormData(): void {
    const data = {
      selected: this.selected
    };
    this.formStorage.saveFormData('step3-2', data);
  }
}
