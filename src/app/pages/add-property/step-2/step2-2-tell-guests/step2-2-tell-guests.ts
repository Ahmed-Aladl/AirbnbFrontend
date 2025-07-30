import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

// Define an interface for type safety
interface Amenity {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-step2-2-tell-guests',
  imports: [CommonModule],
  templateUrl: './step2-2-tell-guests.html',
  styleUrl: './step2-2-tell-guests.css'
})
export class Step22TellGuests implements OnInit, OnDestroy {
  private subscription!: Subscription;
  // Amenity categories with image paths
  guestFavorites: Amenity[] = [
    { name: 'Wifi', icon: 'https://img.icons8.com/?size=100&id=Wtw8719Lene4&format=png&color=000000' },
    { name: 'TV', icon: 'https://img.icons8.com/?size=100&id=1Pp9bo7ydgBz&format=png&color=000000' },
    { name: 'Kitchen', icon: 'https://img.icons8.com/?size=100&id=1HozBADAhgjc&format=png&color=000000' },
    { name: 'Washer', icon: 'https://img.icons8.com/?size=100&id=103440&format=png&color=000000' },
    { name: 'Free parking on premises', icon: 'https://img.icons8.com/?size=100&id=Atb5mR0Y5hAu&format=png&color=000000' }
  ];

  standoutAmenities: Amenity[] = [
    { name: 'Pool', icon: 'https://img.icons8.com/?size=100&id=25980&format=png&color=000000' },
    { name: 'Hot tub', icon: 'https://img.icons8.com/?size=100&id=yzvkL1jvY3pe&format=png&color=000000' },
    { name: 'Patio', icon: 'https://www.svgrepo.com/show/489314/patio.svg' }
  ];

  safetyItems: Amenity[] = [
    { name: 'Smoke alarm', icon: 'https://img.icons8.com/?size=100&id=ruyATKFXOKXR&format=png&color=000000' },
    { name: 'First aid kit', icon: 'https://img.icons8.com/?size=100&id=112253&format=png&color=000000' },
    { name: 'Fire extinguisher', icon: 'https://img.icons8.com/?size=100&id=mKoQHtzDltfs&format=png&color=000000' }
  ];

  // Selected amenities are stored by name for efficient lookup
  selectedAmenities: Set<string> = new Set();

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step2-2');
    if (savedData?.selectedAmenities) {
      this.selectedAmenities = new Set(savedData.selectedAmenities);
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

  // Method to toggle amenity selection
  toggleAmenity(amenity: Amenity): void {
    if (this.selectedAmenities.has(amenity.name)) {
      this.selectedAmenities.delete(amenity.name);
    } else {
      this.selectedAmenities.add(amenity.name);
    }
    this.saveFormData();
  }

  private saveFormData(): void {
    const data = {
      selectedAmenities: Array.from(this.selectedAmenities)
    };
    this.formStorage.saveFormData('step2-2', data);
  }

  // Method to check if amenity is selected by its name
  isAmenitySelected(amenity: Amenity): boolean {
    return this.selectedAmenities.has(amenity.name);
  }
}