import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { debounceTime, Subscription, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Icon } from 'leaflet';

@Component({
  selector: 'app-step1-4-where',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './step1-4-1-where.html',
  styleUrl: './step1-4-1-where.css'
})
export class Step14Where implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private subscription!: Subscription;
  address: string = '';
  latitude: number = 26.82055;
  longitude: number = 30.8025;

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.mapChangeSubject.pipe(
      debounceTime(1500)
    ).subscribe(({ lat, lng }) => {
      this.handleMapChange(lat, lng);
    });
  }

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step1-4-1');
    if (savedData) {
      this.address = savedData.address || '';
      this.latitude = savedData.latitude || 26.82055;
      this.longitude = savedData.longitude || 30.8025;
    }

    // Subscribe to next step event
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveFormData();
    });
  }

  ngAfterViewInit(): void {
    this.initLeafletMap();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private saveFormData(): void {
    const data = {
      address: this.address,
      coordinates: {
        lat: this.latitude,
        lng: this.longitude
      }
    };
    this.formStorage.saveFormData('step1-4-1', data);
  }

  isLoading = true;
  isMapLoading = false;

  map: L.Map | null = null;
  private mapChangeSubject = new Subject<{ lat: number, lng: number, zoom: number }>();
  private isMapInitialized = false;
  private shouldFitBounds = true;
  private isUserInteraction = false;

  private marker: L.Marker | null = null;

  private initLeafletMap(): void {
    if (this.mapContainer && this.mapContainer.nativeElement && !this.map) {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.latitude, this.longitude],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      // Add marker at initial position
      this.addMarker(this.latitude, this.longitude);

      // Add click event to map
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.updateLocation(lat, lng);
      });

      this.map.whenReady(() => {
        this.isLoading = false;
        this.isMapInitialized = true;
        this.setupMapEventListeners();
      });
    }
  }

  private addMarker(lat: number, lng: number): void {
    if (this.map) {
      if (this.marker) {
        this.marker.remove();
      }

      this.marker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.map);

      // Handle marker drag events
      this.marker.on('dragend', (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        this.updateLocation(position.lat, position.lng);
      });
    }
  }

  private updateLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;
    this.addMarker(lat, lng);
    this.reverseGeocode(lat, lng);
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      if (data.display_name) {
        this.address = data.display_name;
        
        // Save detailed address components
        const address = data.address;
        const addressData = {
          country: address.country_code?.toUpperCase() || '',
          countryName: address.country || '',
          street: [address.road, address.house_number].filter(Boolean).join(' ') || '',
          apt: '',
          city: address.city || address.town || address.village || '',
          state: address.state || '',
          zipcode: address.postcode || '',
          latitude: lat,
          longitude: lng,
          formattedAddress: data.display_name
        };
        
        // Save both the current step data and the next step data
        this.saveFormData();
        this.formStorage.saveFormData('step1-4-2', addressData);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  }

  // Get current location
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.updateLocation(latitude, longitude);
          if (this.map) {
            this.map.setView([latitude, longitude], 16);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  private setupMapEventListeners() {
    if (!this.map) return;

    const updateMapInfo = () => {
      if (!this.isMapInitialized) return;
      const center = this.map!.getCenter();
      const zoom = this.map!.getZoom();
      this.mapChangeSubject.next({ lat: center.lat, lng: center.lng, zoom });
    };

    this.map.on('movestart', () => {
      if (this.isMapInitialized) {
        this.shouldFitBounds = false;
        this.isMapLoading = true;
      }
    });

    this.map.on('moveend', () => {
      this.isMapLoading = false;
      updateMapInfo();
    });

    this.map.on('zoomstart', () => {
      if (this.isMapInitialized) {
        this.isUserInteraction = true;
        this.shouldFitBounds = false;
        this.isMapLoading = true;
      }
    });

    this.map.on('zoomend', () => {
      this.isMapLoading = false;
      updateMapInfo();
    });
  }

  private async handleMapChange(latitude: number, longitude: number) {
    console.log('🔄 Map changed:', {
      lat: latitude.toFixed(4),
      lng: longitude.toFixed(4),
      distance: 10000
    });
  }
}
