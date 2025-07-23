import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  price: number;
  maxGuests: number;
  photos: string[];
  amenities: string[];
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  updatedAt?: Date;
}

export interface MenuSection {
  id: keyof Property | 'photos' | 'amenities' | 'location';
  label: string;
  icon: string;
  isActive: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

@Component({
  selector: 'app-update-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-list.html',
  styleUrls: ['./update-list.css']
})
export class UpdateList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  property: Property | null = null;
  propertyForm!: FormGroup;
  isLoading = false;
  hasUnsavedChanges = false;

  menuSections: MenuSection[] = [
    { id: 'photos', label: 'Photos', icon: '📸', isActive: true, hasChanges: false, isSaving: false },
    { id: 'title', label: 'Title', icon: '📝', isActive: false, hasChanges: false, isSaving: false },
    { id: 'propertyType', label: 'Property type', icon: '🏠', isActive: false, hasChanges: false, isSaving: false },
    { id: 'price', label: 'Pricing', icon: '💰', isActive: false, hasChanges: false, isSaving: false },
    { id: 'maxGuests', label: 'Guests', icon: '👥', isActive: false, hasChanges: false, isSaving: false },
    { id: 'description', label: 'Description', icon: '📄', isActive: false, hasChanges: false, isSaving: false },
    { id: 'amenities', label: 'Amenities', icon: '✨', isActive: false, hasChanges: false, isSaving: false },
    { id: 'location', label: 'Location', icon: '📍', isActive: false, hasChanges: false, isSaving: false }
  ];

  activeSection: string = 'photos';

  propertyTypes = [
    'House', 'Apartment', 'Condo', 'Villa', 'Townhouse',
    'Cabin', 'Loft', 'Studio', 'Guesthouse', 'Hotel'
  ];

  availableAmenities = [
    'Wifi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning',
    'Heating', 'Dedicated workspace', 'TV', 'Hair dryer', 'Iron',
    'Pool', 'Hot tub', 'Free parking', 'EV charger', 'Crib',
    'Gym', 'BBQ grill', 'Breakfast', 'Indoor fireplace', 'Smoking allowed',
    'Pets allowed', 'Party or event friendly', 'Camera/recording device'
  ];

  // Guest icons array - different poses/types of people icons
 guestIcons = [
  
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/354bca63-8008-45d7-b76f-c1c19a788825.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/5a0d9cb7-0aea-44e9-a61a-017685c6d2d0.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/244dc498-e875-449e-b855-5d13b8f44d50.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/70da4d82-9182-4edf-a4ef-97326fcfdd0b.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/48b87e37-cd4a-4a56-9422-79e278764b6e.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/bd44136d-ddda-4f3e-916c-3dcc816e5fa5.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/708f660d-443a-4283-9c36-484029accd65.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/84572734-6766-47a9-9fb8-f7ee9a70f63a.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/8b0a737b-2c87-43b6-a4a2-dce4ebcb1bdf.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/2a8e78db-8781-4bc7-a746-bef45ed6aed9.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/701cd29e-3c5e-4055-b54f-2ced17b792d6.png',
  'https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/50f7cb91-d0fe-4726-963c-7242660b1db3.png'
];
  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProperty();
    this.setupFormChangeTracking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackBySection(index: number, section: MenuSection): string {
    return section.id as string;
  }

  private initializeForm(): void {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      propertyType: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      maxGuests: [1, [Validators.required, Validators.min(1), Validators.max(16)]],
      photos: [[]],
      amenities: [[]],
      location: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required]
      })
    });
  }

  private setupFormChangeTracking(): void {
    Object.keys(this.propertyForm.controls).forEach(key => {
      this.propertyForm.get(key)?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.updateSectionChangeStatus(key);
        });
    });
  }

  private updateSectionChangeStatus(sectionId: string): void {
    const section = this.menuSections.find(s => s.id === sectionId);
    if (section && this.property) {
      const formValue = this.propertyForm.get(sectionId)?.value;
      const originalValue = this.property[sectionId as keyof Property];
      
      if (sectionId === 'location') {
        section.hasChanges = JSON.stringify(formValue) !== JSON.stringify(originalValue);
      } else if (Array.isArray(formValue)) {
        section.hasChanges = JSON.stringify(formValue) !== JSON.stringify(originalValue);
      } else {
        section.hasChanges = formValue !== originalValue;
      }
    }
  }

  private loadProperty(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.property = {
        id: '1',
        title: 'Cozy and good',
        description: 'A beautiful space with all the amenities you need for a comfortable stay.',
        propertyType: 'Apartment',
        price: 120,
        maxGuests: 1,
        photos: [
          
        ],
        amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'],
        location: {
          address: '123 Main Street',
          city: 'San Francisco',
          country: 'United States'
        }
      };

      this.populateForm();
      this.isLoading = false;
    }, 800);
  }

  private populateForm(): void {
    if (this.property) {
      this.propertyForm.patchValue(this.property);
      this.menuSections.forEach(section => {
        section.hasChanges = false;
        section.isSaving = false;
      });
    }
  }

  onMenuSectionClick(section: MenuSection): void {
    this.menuSections.forEach(s => s.isActive = false);
    section.isActive = true;
    this.activeSection = section.id as string;
  }

  onSaveCurrentSection(): void {
    const activeSection = this.getActiveSectionObject();
    if (activeSection) {
      this.onSaveSection(activeSection);
    }
  }

  onSaveSection(section: MenuSection): void {
    if (!section.hasChanges || section.isSaving) return;

    section.isSaving = true;
    const sectionData = this.getSectionData(section.id as string);

    setTimeout(() => {
      this.saveSectionToAPI(section.id as string, sectionData)
        .then(() => {
          section.hasChanges = false;
          section.isSaving = false;
          section.lastSaved = new Date();
          
          if (this.property) {
            if (section.id === 'location') {
              this.property.location = { ...sectionData };
            } else {
              (this.property as any)[section.id] = sectionData;
            }
          }
        })
        .catch((error) => {
          section.isSaving = false;
          console.error(`Error saving ${section.id}:`, error);
        });
    }, 1000);
  }

  private getSectionData(sectionId: string): any {
    return this.propertyForm.get(sectionId)?.value;
  }

  private async saveSectionToAPI(sectionId: string, data: any): Promise<void> {
    const endpoints = {
      photos: '/api/properties/photos',
      title: '/api/properties/title',
      propertyType: '/api/properties/type',
      price: '/api/properties/pricing',
      maxGuests: '/api/properties/guests',
      description: '/api/properties/description',
      amenities: '/api/properties/amenities',
      location: '/api/properties/location'
    };

    console.log(`Saving ${sectionId} to ${endpoints[sectionId as keyof typeof endpoints]}:`, data);
    
    return new Promise((resolve) => {
      resolve();
    });
  }

  onPhotoAdd(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const currentPhotos = this.propertyForm.get('photos')?.value || [];
      const newPhotoUrl = `https://via.placeholder.com/400x300/FFE0B2/F57C00?text=New+Photo+${currentPhotos.length + 1}`;
      this.propertyForm.patchValue({
        photos: [...currentPhotos, newPhotoUrl]
      });
    }
  }

  onPhotoRemove(index: number): void {
    const currentPhotos = this.propertyForm.get('photos')?.value || [];
    currentPhotos.splice(index, 1);
    this.propertyForm.patchValue({ photos: [...currentPhotos] });
  }

  onAmenityToggle(amenity: string): void {
    const currentAmenities = this.propertyForm.get('amenities')?.value || [];
    const index = currentAmenities.indexOf(amenity);

    if (index > -1) {
      currentAmenities.splice(index, 1);
    } else {
      currentAmenities.push(amenity);
    }

    this.propertyForm.patchValue({ amenities: [...currentAmenities] });
  }

  isAmenitySelected(amenity: string): boolean {
    const currentAmenities = this.propertyForm.get('amenities')?.value || [];
    return currentAmenities.includes(amenity);
  }

  getFieldError(fieldName: string): string {
    const field = this.propertyForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `This field is required`;
      if (field.errors['maxlength']) return `Too long`;
      if (field.errors['min']) return `Must be at least 1`;
      if (field.errors['max']) return `Maximum exceeded`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.propertyForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getActiveSectionObject(): MenuSection | undefined {
    return this.menuSections.find(section => section.isActive);
  }

  hasChangesInActiveSection(): boolean {
    const activeSection = this.getActiveSectionObject();
    return activeSection?.hasChanges || false;
  }

  isSavingActiveSection(): boolean {
    const activeSection = this.getActiveSectionObject();
    return activeSection?.isSaving || false;
  }

  getSaveButtonText(): string {
    if (this.isSavingActiveSection()) {
      return '';
    }
    const activeSection = this.getActiveSectionObject();
    return activeSection?.lastSaved ? 'Saved' : 'Save';
  }

  getSaveButtonClass(): string {
    const activeSection = this.getActiveSectionObject();
    if (activeSection?.lastSaved && !activeSection.hasChanges) {
      return 'saved';
    }
    return '';
  }

  // New method to get guest icons based on current guest count
  getGuestIconsToShow(): string[] {
    const guestCount = this.propertyForm.get('maxGuests')?.value || 1;
    const iconsToShow: string[] = [];
    
    // Show icons up to the guest count, cycling through available icons
    for (let i = 0; i < guestCount && i < 16; i++) {
      const iconIndex = i % this.guestIcons.length;
      iconsToShow.push(this.guestIcons[iconIndex]);
    }
    
    return iconsToShow;
  }

  // Track by function for guest icons
  trackByGuestIcon(index: number, icon: string): string {
    return `${index}-${icon}`;
  }
}