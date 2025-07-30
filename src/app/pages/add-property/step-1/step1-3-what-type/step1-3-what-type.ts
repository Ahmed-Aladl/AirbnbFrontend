import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step1-3-what-type',
  imports: [CommonModule],
  templateUrl: './step1-3-what-type.html',
  styleUrl: './step1-3-what-type.css'
})
export class Step13WhatType implements OnInit, OnDestroy {
  private subscription!: Subscription;
  
  // List of available property types
  propertyTypes: string[] = [
    'Apartment',
    'House',
    'Villa',
    'Cottage',
    'Studio',
    'Loft',
    'Other'
  ];

  // Currently selected property type
  selectedType: string | null = null;
  
  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  // List of place options for UI selection
  placeOptions = [
    {
      key: 'entire',
      title: 'An entire place',
      description: 'Guests have the whole place to themselves.'
    },
    {
      key: 'room',
      title: 'A room',
      description: 'Guests have their own room in a home, plus access to shared spaces.'
    },
    {
      key: 'shared',
      title: 'A shared room',
      description: 'Guests sleep in a room or common area that may be shared with others.'
    }
  ];

  // Currently selected place type for UI
  selectedPlace: string = 'entire';

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step1-3');
    if (savedData?.selectedType) {
      this.selectedType = savedData.selectedType;
    }
    if (savedData?.selectedPlace) {
      this.selectedPlace = savedData.selectedPlace;
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

  // Method to select a property type
  selectType(type: string): void {
    this.selectedType = type;
    this.saveFormData();
  }

  // Method to select a place type
  selectPlace(key: string): void {
    this.selectedPlace = key;
    this.saveFormData();
  }

  private saveFormData(): void {
    const data = {
      selectedType: this.selectedType,
      selectedPlace: this.selectedPlace
    };
    this.formStorage.saveFormData('step1-3', data);
  }
}
