import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PropertyFormStorageService } from '../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../core/services/ListingWizard/listing-wizard.service';
import { PropertyCreationService } from '../../core/services/Property/property-creation.service';

@Component({
  selector: 'app-listing-wizard-layout',
  templateUrl: './listing-wizard-layout.html',
  styleUrls: ['./listing-wizard-layout.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ListingWizardLayoutComponent {
  @Input() showFooter = true;
  @Input() isFirstStep = false;
  @Input() isLastStep = false;
  @Input() canProceed = true;
  @Input() currentStep = 1;
  @Input() totalSteps = 3;
  @Input() progressPercentage = 0;
  @Input() showBackButton = true;

  @Output() onSaveExit = new EventEmitter<void>();
  @Output() onPrevStep = new EventEmitter<void>();
  @Output() onNextStep = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  private readonly stepRoutes: string[] = [
    '', // Corresponds to StepsPage
    'step1-1-tell-us',
    'step1-2-which-of',
    'step1-3-what-type',
    'step1-4-1-where',
    'step1-4-2-confirm-address',
    'step1-5-basic-about',
    'step2-1-make-your',
    'step2-2-tell-guests',
    'step2-3-1-add-photos',
    'step2-3-3-photos-ta-da',
    'step2-4-title',
    'step2-5-describe',
    'step2-6-description',
    'step3-1-finish',
    'step3-2-pick-booking',
    'step3-3-choose-welcome',
    'step3-4-1-pricing',
    'step3-4-2-pricing-tax',
    'step3-5-add-discount',
    'step3-6-safety'
  ];

  constructor(
    private router: Router,
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService,
    private propertyCreationService: PropertyCreationService
  ) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateProgress();
        this.updateStepState();
      });
  }

  handleSubmit() {
    // Build property data from wizard form storage
    const propertyData = this.propertyCreationService.buildPropertyFromWizard();
    
    // Ensure images array exists
    const finalPropertyData = {
      ...propertyData,
      images: propertyData.images || []
    };
    
    // Create the property
    this.propertyCreationService.createProperty(finalPropertyData).subscribe({
      next: (response) => {
        // Clear form storage
        this.formStorage.clearFormData();
        // Clear local storage
        localStorage.removeItem('property_form_data');
        // Navigate to success page or property listing
        this.router.navigate(['/host']);
      },
      error: (error) => {
        console.error('Error creating property:', error);
        // Handle error (show error message to user)
      }
    });
  }

  private getCurrentStepIndex(): number {
    const url = this.router.url;
    const wizardBasePath = '/listing-wizard';

    // Handle the root case for the wizard (steps-page)
    if (url === wizardBasePath || url === `${wizardBasePath}/`) {
      return this.stepRoutes.indexOf('');
    }

    // Handle all other steps
    const stepPath = url.substring(wizardBasePath.length + 1);
    return this.stepRoutes.indexOf(stepPath);
  }

  private updateProgress(): void {
    const currentStepIndex = this.getCurrentStepIndex();
    if (currentStepIndex !== -1) {
      this.progressPercentage = (currentStepIndex / (this.stepRoutes.length - 1)) * 100;
    }
  }

  private updateStepState(): void {
    const currentIndex = this.getCurrentStepIndex();
    this.isFirstStep = currentIndex === 0;
    this.isLastStep = currentIndex === this.stepRoutes.length - 1;
    this.showBackButton = currentIndex > 0;
  }

  navigateToNextStep(): void {
    const currentIndex = this.getCurrentStepIndex();
    if (currentIndex > -1 && currentIndex < this.stepRoutes.length - 1) {
      // Trigger saving in the current component
      this.wizardService.triggerNextStep();
      
      // Let any parent components know
      this.onNextStep.emit();

      // Navigate to next step
      const nextStep = this.stepRoutes[currentIndex + 1];
      this.router.navigate(['listing-wizard', nextStep]);
    }
  }

  navigateToPrevStep(): void {
    const currentIndex = this.getCurrentStepIndex();

    if (currentIndex === 1) {
      // When on the first *real* step, navigate explicitly to the base URL.
      this.router.navigate(['/listing-wizard']);
    } else if (currentIndex > 1) {
      // For all other steps, navigate to the previous step in the array.
      const prevStep = this.stepRoutes[currentIndex - 1];
      this.router.navigate(['/listing-wizard', prevStep]);
    }
    
    this.onPrevStep.emit();
  }
}