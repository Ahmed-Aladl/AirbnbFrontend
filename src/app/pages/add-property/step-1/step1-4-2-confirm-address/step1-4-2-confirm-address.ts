import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-step1-4-2-confirm-address',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './step1-4-2-confirm-address.html',
  styleUrl: './step1-4-2-confirm-address.css'
})
export class Step142ConfirmAddress implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  private subscription!: Subscription;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  // Address fields
  country: string = '';
  street: string = '';
  apt: string = '';
  city: string = '';
  state: string = '';
  zipcode: string = '';
  latitude: number = 0;
  longitude: number = 0;
  formattedAddress: string = '';

  // Location preference toggle
  showSpecificLocation: boolean = true;
  
  // Country display
  countryName: string = '';

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step1-4-2');
    if (savedData) {
      this.country = savedData.country || this.country;
      this.countryName = savedData.countryName || this.countryName;
      this.street = savedData.street || this.street;
      this.apt = savedData.apt || this.apt;
      this.city = savedData.city || this.city;
      this.state = savedData.state || this.state;
      this.zipcode = savedData.zipcode || this.zipcode;
      this.latitude = savedData.latitude || this.latitude;
      this.longitude = savedData.longitude || this.longitude;
      this.formattedAddress = savedData.formattedAddress || this.formattedAddress;
      this.showSpecificLocation = savedData.showSpecificLocation ?? true;
    }

    // Get the location data from previous step if available
    const locationData = this.formStorage.getStepData('step1-4-1');
    if (locationData && (!savedData || !savedData.formattedAddress)) {
      this.latitude = locationData.latitude;
      this.longitude = locationData.longitude;
      this.formattedAddress = locationData.address;
      this.reverseGeocode(this.latitude, this.longitude);
    }

    // Subscribe to next step event
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveFormData();
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      if (data.address) {
        const address = data.address;
        this.countryName = address.country || '';
        this.country = data.address.country_code?.toUpperCase() || '';
        this.street = [address.road, address.house_number].filter(Boolean).join(' ') || '';
        this.city = address.city || address.town || address.village || '';
        this.state = address.state || '';
        this.zipcode = address.postcode || '';
        this.formattedAddress = data.display_name;
        this.saveFormData();
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (this.mapContainer && this.mapContainer.nativeElement && !this.map) {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.latitude || 26.82055, this.longitude || 30.8025],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      if (this.latitude && this.longitude) {
        this.addMarker(this.latitude, this.longitude);
      }
    }
  }

  private addMarker(lat: number, lng: number): void {
    if (this.map) {
      if (this.marker) {
        this.marker.remove();
      }

      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.map.setView([lat, lng], 15);
    }
  }

  private saveFormData(): void {
    this.formStorage.saveFormData('step1-4-2', {
      country: this.country,
      countryName: this.countryName,
      street: this.street,
      apt: this.apt,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      latitude: this.latitude,
      longitude: this.longitude,
      formattedAddress: this.formattedAddress,
      showSpecificLocation: this.showSpecificLocation
    });
  }

  // Methods to handle input changes
  onCountryChange(newCountry: string): void {
    this.country = newCountry;
    this.saveFormData();
  }
  onStreetChange(newStreet: string): void {
    this.street = newStreet;
    this.saveFormData();
  }
  onAptChange(newApt: string): void {
    this.apt = newApt;
    this.saveFormData();
  }
  onCityChange(newCity: string): void {
    this.city = newCity;
    this.saveFormData();
  }
  onStateChange(newState: string): void {
    this.state = newState;
    this.saveFormData();
  }
  onZipcodeChange(newZipcode: string): void {
    this.zipcode = newZipcode;
    this.saveFormData();
  }
  onLocationPreferenceChange(value: boolean): void {
    this.showSpecificLocation = value;
    this.saveFormData();
  }
}
