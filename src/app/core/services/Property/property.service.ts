// src/app/shared/services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Property } from '../../models/Property';
import { environment } from '../../../../environments/environment.development';
import { PropertyImage } from '../../models/PropertyImage';

import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';


interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface Result<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

export interface PropertyDisplayDTO {
  id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  averageRating: number;
  reviewCount: number;
  isFavourite: boolean;
  isActive: boolean;
  isDeleted: boolean;
  propertyTypeId: number;
  hostId: string;
  images?: PropertyImageDisplayDTO[];
}

export interface PropertyImageDisplayDTO {
  id: number;
  imageUrl: string;
  propertyId: number;
}

// NEW: Property Type DTO interface
export interface PropertyTypeDto {
  id: number;
  name: string;
}

export interface Country {
  iso2: string;
  iso3: string;
  country: string;
  cities: string[];
}

export interface CountriesResponse {
  error: boolean;
  msg: string;
  data: Country[];
}

interface SearchPropertiesResponse {
  items: Property[];
  metaData: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface SearchParams {
  country?: string;
  longitude?: number;
  latitude?: number;
  guestsCount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  maxDistanceKm?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private readonly propertyUrl = `${environment.baseUrl}/property`;
  private baseUrl = `${environment.baseUrl}/Property`;
  private propertyTypeUrl = `${environment.baseUrl}/PropertyType`; // NEW: Property Type endpoint
  private countriesApiUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private http: HttpClient) { }

  // NEW: Get all property types from API
  getAllPropertyTypes(): Observable<PropertyTypeDto[]> {
    return this.http.get<PropertyTypeDto[]>(this.propertyTypeUrl, { withCredentials: true });
  }

  getImagesByPropertyId(id: number): Observable<PropertyImage[]> {
    return this.http.get<Result<PropertyImage[]>>(`${this.baseUrl}/${id}/images`).pipe(
      map(res => res.data)
    );
  }

  uploadPhotos(formData: FormData) {
    return this.http.post(`${this.baseUrl}/property-images/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getAllProperties(): Observable<Property[]> {
    return this.http.get<ApiResponse<Property[]>>(this.propertyUrl)
      .pipe(
        map(response => response.data)
      );
  }

  getPropertyById(propertyId: number): Observable<Property> {
    const url = `${this.propertyUrl}/${propertyId}`;
    return this.http.get<ApiResponse<Property>>(url)
      .pipe(
        map(response => response.data)
      );
  }

  // UPDATED: Update property method to match new backend - no propertyId in URL
  updateProperty(propertyData: PropertyDisplayDTO): Observable<Result<PropertyDisplayDTO>> {
    // Log the payload being sent for debugging
    console.log('Sending update payload:', propertyData);

    // Send PUT request to base URL without property ID in path
    return this.http.put<Result<PropertyDisplayDTO>>(this.baseUrl, propertyData, {
      withCredentials: true // Add credentials for authorization
    });
  }

  // UPDATED: Update specific property section with complete DTO
  updatePropertySection(property: Property, sectionData: any, sectionType: string): Observable<Result<PropertyDisplayDTO>> {
    // Create complete DTO with all required fields
    const completeDTO = this.createCompleteDTO(property, sectionData, sectionType);
    return this.updateProperty(completeDTO);
  }

  // UPDATED: Create complete DTO with all required fields
  private createCompleteDTO(property: Property, sectionData: any, sectionType: string): PropertyDisplayDTO {
    // Start with the current property data
    const dto: PropertyDisplayDTO = {
      id: property.id, // ID is now required in the body
      title: property.title,
      description: property.description,
      city: property.city,
      country: property.country,
      state: property.state,
      latitude: property.latitude,
      longitude: property.longitude,
      pricePerNight: property.pricePerNight,
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms || 0,
      beds: property.beds || 0,
      bathrooms: property.bathrooms || 0,
      averageRating: property.averageRating || 0,
      reviewCount: property.reviewCount || 0,
      isFavourite: property.isFavourite || false,
      isActive: property.isActive || true,
      isDeleted: property.isDeleted || false,
      propertyTypeId: property.propertyTypeId,
      hostId: property.hostId // This is required for authorization
    };

    // Update specific section based on type
    switch (sectionType) {
      case 'title':
        dto.title = sectionData;
        break;

      case 'rooms':
        dto.bedrooms = Number(sectionData.bedrooms) || property.bedrooms || 1;
        dto.beds = Number(sectionData.beds) || property.beds || 1;
        dto.bathrooms = Number(sectionData.bathrooms) || property.bathrooms || 1;
        break;

      case 'description':
        dto.description = sectionData;
        break;

      case 'price':
        dto.pricePerNight = Number(sectionData);
        break;

      case 'maxGuests':
        dto.maxGuests = Number(sectionData);
        break;

      case 'propertyId':
        dto.propertyTypeId = Number(sectionData);
        break;

      case 'location':
        dto.city = sectionData.city || property.city;
        dto.country = sectionData.country || property.country;
        dto.state = sectionData.address || property.state;
        if (sectionData.coordinates) {
          dto.latitude = Number(sectionData.coordinates.lat) || property.latitude;
          dto.longitude = Number(sectionData.coordinates.lng) || property.longitude;
        }
        break;

      default:
        // For other fields, merge the data
        Object.assign(dto, sectionData);
    }

    console.log(`Created complete DTO for ${sectionType}:`, dto);
    return dto;
  }

  getNearestProperties(page: number = 1, pageSize: number = 10, maxDistanceKm: number = 10): Observable<Result<{ items: Property[] }>> {
    const headers = new HttpHeaders()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('maxDistanceKm', maxDistanceKm.toString());

    return this.http.get<Result<{ items: Property[] }>>(`${this.baseUrl}/nearest`, { headers });
  }

  getAllCountries(): Observable<CountriesResponse> {
    return this.http.get<CountriesResponse>(this.countriesApiUrl, {
      withCredentials: false
    });
  }

  searchProperties(params: SearchParams): Observable<Result<SearchPropertiesResponse>> {
    const queryParams: any = {};

    if (params.country) queryParams.Country = params.country;
    if (params.longitude != null) queryParams.Longitude = params.longitude;
    if (params.latitude != null) queryParams.Latitude = params.latitude;
    if (params.guestsCount != null) queryParams.GuestsCount = params.guestsCount;
    if (params.startDate) queryParams.StartDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page) queryParams.Page = params.page;
    queryParams.PageSize = 12;
    if (params.maxDistanceKm != null) queryParams.maxDistanceKm = params.maxDistanceKm;

    return this.http.get<Result<SearchPropertiesResponse>>(`${this.baseUrl}/search`, {
      params: queryParams
    });
  }

  // To reverse
  getGuetsAndPricePerNeightPropertyById(id: number): Observable<{ maxGuests: number, pricePerNeight: number }> {
    return this.http.get<{ maxGuests: number, pricePerNeight: number }>(`${this.baseUrl}/property/${id}`);
  }

  deletePropertyImages(propertyId: number, imageIds: number[]): Observable<Result<boolean>> {
    const formData = new FormData();

    // Add image IDs to form data
    imageIds.forEach(id => {
      formData.append('imgIds', id.toString());
    });

    // Create a custom HTTP request to support DELETE with body
    const request = new HttpRequest(
      'DELETE',
      `${this.baseUrl}/property-images/delete/${propertyId}`,
      formData,
      {
        reportProgress: false,
        withCredentials: true
      }
    );

    return this.http.request<Result<boolean>>(request).pipe(
      map((event: any): Result<boolean> => {
        console.log('Delete service response event:', event); // Debug log

        // Handle the response event
        if (event.body) {
          return event.body as Result<boolean>;
        }

        // FIXED: Handle 204 No Content responses
        if (event.status === 204) {
          // Return a successful result for 204 responses
          return {
            data: true,
            isSuccess: true,
            message: 'Images deleted successfully'
          } as Result<boolean>;
        }

        // Return default success result if no body
        return {
          data: true,
          isSuccess: true,
          message: 'Images deleted successfully'
        } as Result<boolean>;
      }),
      // Add error handling
      catchError((error: HttpErrorResponse): Observable<Result<boolean>> => {
        console.error('Delete images error:', error);

        // FIXED: Handle 204 as success in error handler too
        if (error.status === 204) {
          // 204 is actually success, Angular treats it as error due to no content
          return new Observable<Result<boolean>>(observer => {
            observer.next({
              data: true,
              isSuccess: true,
              message: 'Images deleted successfully'
            });
            observer.complete();
          });
        }

        throw error;
      })
    );
  }
}
