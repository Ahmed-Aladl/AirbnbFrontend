import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Property } from '../../models/Property';
import { PropertyImage } from '../../models/PropertyImage';
import { PropertyFormStorageService } from '../ListingWizard/property-form-storage.service';
import { PropertyDisplayDTO } from '../../models/PropertyDisplayDTO';

interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyCreationService {
  private readonly baseUrl = `${environment.base}/api/Property/1`;

  constructor(
    private http: HttpClient,
    private formStorage: PropertyFormStorageService
  ) {}

  createProperty(property: Omit<Property, 'id' | 'isFavourite'>): Observable<PropertyDisplayDTO> {
    // Property already has hostId and other required fields set
    const propertyWithHostId = {
      ...property
    };

    return this.http.post<ApiResponse<PropertyDisplayDTO>>(this.baseUrl, propertyWithHostId)
      .pipe(
        map(response => {
          if (response.isSuccess) {
            // Clear the form storage after successful creation
            this.formStorage.clearFormData();
            return response.data;
          }
          throw new Error(response.message);
        })
      );
  }

  // Helper method to build property data from wizard steps
  buildPropertyFromWizard(): Omit<PropertyDisplayDTO, 'id'> {
    const formData = this.formStorage.getFormData();
    
    // Log the coordinates for debugging
    console.log('Coordinates from form:', formData['step1-4-1']?.coordinates);
    
    const property: Omit<PropertyDisplayDTO, 'id'> = {
      title: formData['step2-4']?.title || '',
      description: formData['step2-6']?.description || '',  // Changed from step2-5 to step2-6
      city: formData['step1-4-2']?.city || '',
      country: formData['step1-4-2']?.country || '',
      state: formData['step1-4-2']?.state || '',
      latitude: parseFloat(formData['step1-4-1']?.coordinates?.lat) || 0,
      longitude: parseFloat(formData['step1-4-1']?.coordinates?.lng) || 0,
      pricePerNight: formData['step3-4-1']?.price || 0,
      maxGuests: formData['step1-5']?.guests || 0,
      bedrooms: formData['step1-5']?.bedrooms || 0,
      beds: formData['step1-5']?.beds || 0,
      bathrooms: formData['step1-5']?.bathrooms || 0,
      propertyTypeId: formData['step1-2']?.propertyTypeId || 1,
      images: formData['step2-3']?.images?.map((image: { url: string; isCover: boolean }) => ({
        groupName: 'property_images',
        imageUrl: image.url,
        isCover: image.isCover || false,
        isDeleted: false
      })) || [],
      // Adding default values for additional properties
      averageRating: 0,
      reviewCount: 0,
      isActive: true,
      isDeleted: false,
      hostId: '1' // Fixed host ID as requested
    };

    return property;
  }
}
