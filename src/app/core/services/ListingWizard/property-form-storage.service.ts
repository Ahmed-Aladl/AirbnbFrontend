import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertyFormStorageService {
  private readonly STORAGE_KEY = 'property_form_data';

  constructor() {}

  // Save form data to local storage
  saveFormData(stepId: string, data: any): void {
    let formData = this.getFormData();
    formData = {
      ...formData,
      [stepId]: data
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));
  }

  // Get all form data from local storage
  getFormData(): any {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  // Get specific step data from local storage
  getStepData(stepId: string): any {
    const formData = this.getFormData();
    return formData[stepId] || {};
  }

  // Clear form data from local storage
  clearFormData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
