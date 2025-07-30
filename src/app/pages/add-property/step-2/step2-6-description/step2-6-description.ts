import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step2-6-description',
  imports: [FormsModule],
  templateUrl: './step2-6-description.html',
  styleUrl: './step2-6-description.css'
})
export class Step26Description implements AfterViewInit, OnInit, OnDestroy {
  description: string = '';
  maxLength: number = 500;
  private subscription!: Subscription;
  @ViewChild('descriptionInput') descriptionInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step2-6');
    if (savedData?.description) {
      this.description = savedData.description;
    }

    // Subscribe to next step event
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveFormData();
    });
  }

  ngAfterViewInit() {
    this.autoResize();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get charCount(): number {
    return this.description.length;
  }

  get limitReached(): boolean {
    return this.charCount >= this.maxLength;
  }

  onInput() {
    this.autoResize();
    this.saveFormData();
  }

  autoResize() {
    if (this.descriptionInput) {
      const textarea = this.descriptionInput.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  private saveFormData(): void {
    this.formStorage.saveFormData('step2-6', { description: this.description });
  }
}
