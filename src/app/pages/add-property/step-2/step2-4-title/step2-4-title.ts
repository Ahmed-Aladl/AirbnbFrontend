import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step2-4-title',
  imports: [FormsModule],
  templateUrl: './step2-4-title.html',
  styleUrl: './step2-4-title.css'
})
export class Step24Title implements AfterViewInit, OnInit, OnDestroy {
  private subscription!: Subscription;
  title: string = '';
  maxLength: number = 32;
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit() {
    this.loadFromStorage();

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

  private loadFromStorage() {
    const savedData = this.formStorage.getStepData('step2-4');
    if (savedData?.title) {
      this.title = savedData.title;
    }
  }

  private saveFormData() {
    const data = {
      title: this.title
    };
    this.formStorage.saveFormData('step2-4', data);
  }

  get charCount(): number {
    return this.title.length;
  }

  get limitReached(): boolean {
    return this.charCount >= this.maxLength;
  }

  onTitleChange(): void {
    this.saveFormData();
  }

  ngAfterViewInit() {
    this.autoResize();
  }

  onInput() {
    this.autoResize();
    this.saveFormData();
  }

  autoResize() {
    if (this.titleInput) {
      const textarea = this.titleInput.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
}
