import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Import all section components
import { PhotosSectionComponent, PhotosSectionData } from './photos-section/photos-section';
import { TitleSectionComponent, TitleSectionData } from './title-section/title-section';
import { PropertyTypeSectionComponent, PropertyTypeSectionData } from './property-type-section/property-type-section';
import { PriceSectionComponent, PriceSectionData } from './price-section/price-section';
import { GuestsSectionComponent, GuestsSectionData } from './guests-section/guests-section';
import { DescriptionSectionComponent, DescriptionSectionData } from './description-section/description-section';
import { AmenitiesSectionComponent, AmenitiesSectionData } from './amenities-section/amenities-section';
import { LocationSectionComponent, LocationSectionData } from './location-section/location-section';
import { RoomsSectionComponent, RoomsSectionData } from './rooms-section/rooms-section';

import { PropertyService } from '../../core/services/Property/property.service';
import { Property } from '../../core/models/Property';
import { PropertyImage } from '../../core/models/PropertyImage';
import { HeaderComponent } from "../../components/host-header/host-header"; 

export interface MenuSection {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  isValid: boolean;
  lastSaved?: Date;
}

@Component({
  selector: 'app-update-list',
  styleUrls: ['./update-list.css'],
  standalone: true,
  imports: [
    CommonModule,
    PhotosSectionComponent,
    TitleSectionComponent,
    PropertyTypeSectionComponent,
    PriceSectionComponent,
    GuestsSectionComponent,
    DescriptionSectionComponent,
    AmenitiesSectionComponent,
    LocationSectionComponent,
    RoomsSectionComponent,
    RouterLink,
    HeaderComponent
],
  templateUrl: './update-list.html',
})
export class UpdateList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ViewChild reference to photos component
  @ViewChild('photosSection') photosComponent!: PhotosSectionComponent;

  // Property data
  property: Property | null = null;
  originalProperty: Property | null = null;
  roomsData: RoomsSectionData | null = null;

  propertyId: number = 0;
  isLoading = false;

  // Menu sections
  menuSections: MenuSection[] = [
    { id: 'photos', label: 'Photos', icon: '📸', isActive: true, hasChanges: false, isSaving: false, isValid: true },
    { id: 'title', label: 'Title', icon: '📝', isActive: false, hasChanges: false, isSaving: false, isValid: true },
    { id: 'propertyId', label: 'Property type', icon: '🏠', isActive: false, hasChanges: false, isSaving: false, isValid: true },
      { id: 'rooms', label: 'Rooms & beds', icon: '🛏️', isActive: false, hasChanges: false, isSaving: false, isValid: true }, // ADD THIS LINE

    { id: 'price', label: 'Pricing', icon: '💰', isActive: false, hasChanges: false, isSaving: false, isValid: true },
    { id: 'maxGuests', label: 'Guests', icon: '👥', isActive: false, hasChanges: false, isSaving: false, isValid: true },
    { id: 'description', label: 'Description', icon: '📄', isActive: false, hasChanges: false, isSaving: false, isValid: true },
    { id: 'amenities', label: 'Amenities', icon: '✨', isActive: false, hasChanges: false, isSaving: false, isValid: true },
    
    { id: 'location', label: 'Location', icon: '📍', isActive: false, hasChanges: false, isSaving: false, isValid: true }
  ];

  activeSection: string = 'photos';

  // Section data
  photosData: PhotosSectionData | null = null;
  titleData: TitleSectionData | null = null;
  propertyTypeData: PropertyTypeSectionData | null = null;
  priceData: PriceSectionData | null = null;
  guestsData: GuestsSectionData | null = null;
  descriptionData: DescriptionSectionData | null = null;
  amenitiesData: AmenitiesSectionData | null = null;
  locationData: LocationSectionData | null = null;

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        const id = params["propertyId"];
        if (id) {
          this.propertyId = id as number;
          this.isLoading = true;
          this.loadProperty();
        }
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProperty(): void {
    if (!this.propertyId) return;

    this.isLoading = true;
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (response) => {
        this.originalProperty = response;
        this.property = response;
        this.mapPropertyToSectionData(response);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load property:', err);
        this.isLoading = false;
      }
    });
  }

  private mapPropertyToSectionData(property: Property): void {
    // Load images first, then map data
    this.loadPropertyImages(property.id).then((images) => {
      this.photosData = {
        photos: images || [],
        propertyId: property.id,
        hostId: property.hostId
      };

      // Map other section data...
      this.titleData = {
        title: property.title
      };

      this.propertyTypeData = {
        propertyTypeId: property.propertyTypeId
      };

      this.priceData = {
        price: property.pricePerNight
      };

      this.guestsData = {
        maxGuests: property.maxGuests || 1
      };

      this.roomsData = {
      bedrooms: property.bedrooms || 1,
      beds: property.beds || 1,
      bathrooms: property.bathrooms || 1
      };


      this.descriptionData = {
        description: property.description
      };

      this.amenitiesData = {
        amenities: [] // Add amenities to your Property model
      };

      this.locationData = {
        location: {
          address: property.state,
          city: property.city,
          country: property.country,
          coordinates: {
            lat: property.latitude,
            lng: property.longitude
          }
        }
      };

      this.cdr.detectChanges();
    });
  }

  // Method to load property images
  private loadPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return new Promise((resolve, reject) => {
      this.propertyService.getImagesByPropertyId(propertyId).subscribe({
        next: (images) => {
          console.log('Loaded property images:', images);
          resolve(images);
        },
        error: (error) => {
          console.error('Failed to load property images:', error);
          resolve([]); // Return empty array on error
        }
      });
    });
  }

  onRoomsDataChange(data: RoomsSectionData): void {
  this.roomsData = data;
  // Also update the main property object for consistency
  if (this.property) {
    this.property.bedrooms = data.bedrooms;
    this.property.beds = data.beds;
    this.property.bathrooms = data.bathrooms;
  }
}

  // Menu navigation
  onMenuSectionClick(section: MenuSection): void {
    this.menuSections.forEach(s => s.isActive = false);
    section.isActive = true;
    this.activeSection = section.id;
  }

  trackBySection(index: number, section: MenuSection): string {
    return section.id;
  }

  // Section data change handlers
  onPhotosDataChange(data: PhotosSectionData): void {
    this.photosData = data;
    
    // Also update the main property object for consistency
    if (this.property) {
      this.property.images = data.photos;
    }
  }

  onTitleDataChange(data: TitleSectionData): void {
    this.titleData = data;
  }

  onPropertyTypeDataChange(data: PropertyTypeSectionData): void {
    this.propertyTypeData = data;
  }

  onPriceDataChange(data: PriceSectionData): void {
    this.priceData = data;
  }

  onGuestsDataChange(data: GuestsSectionData): void {
    this.guestsData = data;
    // Also update the main property object for consistency
    if (this.property) {
      this.property.maxGuests = data.maxGuests;
    }
  }

  onDescriptionDataChange(data: DescriptionSectionData): void {
    this.descriptionData = data;
  }

  onAmenitiesDataChange(data: AmenitiesSectionData): void {
    this.amenitiesData = data;
  }

  onLocationDataChange(data: LocationSectionData): void {
    this.locationData = data;
  }

  // Section state change handlers
  onSectionHasChanges(sectionId: string, hasChanges: boolean): void {
    const section = this.menuSections.find(s => s.id === sectionId);
    if (section) {
      section.hasChanges = hasChanges;
    }
  }

  onSectionValidationChange(sectionId: string, isValid: boolean): void {
    const section = this.menuSections.find(s => s.id === sectionId);
    if (section) {
      section.isValid = isValid;
    }
  }

  onSectionSaveComplete(sectionId: string): void {
    const section = this.menuSections.find(s => s.id === sectionId);
    if (section) {
      section.hasChanges = false;
      section.isSaving = false;
      section.lastSaved = new Date();
    }
  }

  // Save functionality
 private async saveSection(section: MenuSection): Promise<void> {
  section.isSaving = true;
  
  try {
    // Handle photos section specially
    if (section.id === 'photos') {
      if (this.photosComponent) {
        await this.photosComponent.handleSave();
        
        // Update section state
        section.hasChanges = false;
        section.isSaving = false;
        section.lastSaved = new Date();
        
        console.log('Successfully saved photos');
      }
    } else {
      // Handle other sections with API calls
      const sectionData = this.getSectionDataForSave(section.id);
      
      if (this.originalProperty && sectionData !== null && sectionData !== undefined) {
        // UPDATED: Remove propertyId parameter since it's now in the DTO body
        await this.propertyService.updatePropertySection(
          this.originalProperty,
          sectionData,
          section.id
        ).toPromise();

        // Update section state
        section.hasChanges = false;
        section.isSaving = false;
        section.lastSaved = new Date();

        // Update original property data
        this.updateOriginalPropertyData(section.id, sectionData);
        
        console.log(`Successfully saved ${section.id}`);
      }
    }
  } catch (error: any) { // Type assertion to 'any' to access error properties
    section.isSaving = false;
    console.error(`Error saving ${section.id}:`, error);
    
    // Enhanced error handling with proper typing
    const httpError = error?.error || error;
    const status = error?.status || httpError?.status;
    const message = httpError?.message || error?.message || 'Unknown error';
    
    if (status === 401) {
      alert(`Unauthorized: You don't have permission to update this property`);
    } else if (status === 404) {
      alert(`Property not found`);
    } else if (status === 409) {
      alert(`Conflict: There was a reference conflict while updating`);
    } else {
      alert(`Failed to save ${section.label}: ${message}`);
    }
  }
  
  this.cdr.detectChanges();
}

// Also add this method to your component for the Save button functionality
onSaveCurrentSection(): void {
  const activeSection = this.getActiveSectionObject();
  if (activeSection && activeSection.hasChanges && !activeSection.isSaving) {
    this.saveSection(activeSection);
  }
}

  private getSectionDataForSave(sectionId: string): any {
    switch (sectionId) {
      case 'title':
        return this.titleData?.title;
      case 'propertyId':
        return this.propertyTypeData?.propertyTypeId;
      case 'price':
        return this.priceData?.price;
      case 'maxGuests':
        return this.guestsData?.maxGuests || 1;
      case 'description':
        return this.descriptionData?.description;
      case 'amenities':
        return this.amenitiesData?.amenities;
      case 'location':
        return this.locationData?.location;
        case 'rooms':
        return this.roomsData;
      default:
        return null;
    }
  }

  private updateOriginalPropertyData(sectionId: string, data: any): void {
    if (!this.originalProperty) return;

    switch (sectionId) {
      case 'title':
        this.originalProperty.title = data;
        break;
      case 'description':
        this.originalProperty.description = data;
        break;
      case 'price':
        this.originalProperty.pricePerNight = Number(data);
        break;
      case 'maxGuests':
        this.originalProperty.maxGuests = Number(data);
        break;
      case 'propertyId':
        this.originalProperty.propertyTypeId = Number(data);
        break;
        case 'rooms':
        this.originalProperty.bedrooms = Number(data.bedrooms);
        this.originalProperty.beds = Number(data.beds);
        this.originalProperty.bathrooms = Number(data.bathrooms);
         break;


      case 'location':
        this.originalProperty.city = data.city;
        this.originalProperty.country = data.country;
        this.originalProperty.state = data.address;
        if (data.coordinates) {
          this.originalProperty.latitude = Number(data.coordinates.lat);
          this.originalProperty.longitude = Number(data.coordinates.lng);
        }
        break;
    }
  }

  // Helper methods
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

  isActiveSectionValid(): boolean {
    const activeSection = this.getActiveSectionObject();
    return activeSection?.isValid || false;
  }

  getSaveButtonText(): string {
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
}