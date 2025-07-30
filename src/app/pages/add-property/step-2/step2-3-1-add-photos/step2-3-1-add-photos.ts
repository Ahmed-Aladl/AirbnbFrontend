import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step232PhotosModal } from '../step2-3-2-photos-modal/step2-3-2-photos-modal';
import { Router } from '@angular/router';
import { PhotosService } from '../../../../core/services/photos.service';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step2-3-add-photos',
  imports: [CommonModule, Step232PhotosModal],
  templateUrl: './step2-3-1-add-photos.html',
  styleUrl: './step2-3-1-add-photos.css'
})
export class Step23AddPhotos implements OnInit, OnDestroy {
  private subscription!: Subscription;
  dropzoneHighlight = false;
  photos: string[] = [];

  constructor(
    public photosService: PhotosService,
    private router: Router,
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  @ViewChild('photosModal') photosModal!: Step232PhotosModal;

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
    const savedData = this.formStorage.getStepData('step2-3-1');
    if (savedData?.photos) {
      this.photos = savedData.photos;
    }
  }

  private saveFormData() {
    const data = {
      photos: this.photos
    };
    this.formStorage.saveFormData('step2-3-1', data);
  }

  openPhotosModal(): void {
    this.photosModal.openModal();
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropzoneHighlight = false;
    if (event.dataTransfer?.files) {
      this.openPhotosModal();
    }
  }
}
