import { Injectable } from '@angular/core';
import { PropertyDisplayDTO } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyFormStorageService {
  private formData: { [key: string]: any } = {};
  private property: Partial<PropertyDisplayDTO> = {};

  constructor() {}

  saveFormData(step: string, data: any): void {
    this.formData[step] = data;
    this.updateProperty(step, data);
  }

  getStepData(step: string): any {
    return this.formData[step];
  }

  private updateProperty(step: string, data: any): void {
    switch(step) {
      case 'step1-4-1':
        this.property.location = {
          latitude: data.latitude,
          longitude: data.longitude
        };
        this.property.address = data.address;
        break;
      // Add other step cases as needed
    }
  }

  getPropertyData(): any {
    return this.property;
  }

  clearFormData(): void {
    this.formData = {};
    this.property = {};
  }
}
