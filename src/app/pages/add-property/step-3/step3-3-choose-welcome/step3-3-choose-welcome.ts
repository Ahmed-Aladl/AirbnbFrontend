import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step3-3-choose-welcome',
  imports: [CommonModule],
  templateUrl: './step3-3-choose-welcome.html',
  styleUrl: './step3-3-choose-welcome.css'
})
export class Step33ChooseWelcome implements OnInit, OnDestroy {
  private subscription!: Subscription;
  options = [
    {
      key: 'any',
      title: 'Any Airbnb guest',
      description: 'Get reservations faster when you welcome anyone from the Airbnb community.'
    },
    {
      key: 'experienced',
      title: 'An experienced guest',
      description: 'For your first guest, welcome someone with a good track record on Airbnb who can offer tips for how to be a great Host.'
    }
  ];
  selected: string = 'any';

  isSelected(key: string): boolean {
    return this.selected === key;
  }

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step3-3');
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

  selectOption(key: string): void {
    this.selected = key;
    this.saveFormData();
  }

  private saveFormData(): void {
    const data = {
      selected: this.selected
    };
    this.formStorage.saveFormData('step3-3', data);
  }
}
