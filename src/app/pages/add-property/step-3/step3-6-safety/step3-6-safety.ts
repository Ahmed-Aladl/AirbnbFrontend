import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step3-6-safety',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step3-6-safety.html',
  styleUrl: './step3-6-safety.css'
})
export class Step36Safety implements OnInit, OnDestroy {
  private subscription!: Subscription;
  safetyItems = [
    {
      key: 'camera',
      label: 'Exterior security camera present',
      checked: false
    },
    {
      key: 'noise',
      label: 'Noise decibel monitor present',
      checked: false
    },
    {
      key: 'weapon',
      label: 'Weapon(s) on the property',
      checked: false
    }
  ];

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step3-6');
    if (savedData?.safetyItems) {
      this.safetyItems = savedData.safetyItems;
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

  toggleItem(idx: number): void {
    if (idx >= 0 && idx < this.safetyItems.length) {
      this.safetyItems[idx].checked = !this.safetyItems[idx].checked;
      this.saveFormData();
    }
  }

  private saveFormData(): void {
    const data = {
      safetyItems: this.safetyItems
    };
    this.formStorage.saveFormData('step3-6', data);
  }
}
