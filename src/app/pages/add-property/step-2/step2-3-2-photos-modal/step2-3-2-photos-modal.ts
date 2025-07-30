import { Component } from '@angular/core';
import { PhotosService } from '../../../../core/services/photos.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step2-3-2-photos-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step2-3-2-photos-modal.html',
  styleUrl: './step2-3-2-photos-modal.css'
})
export class Step232PhotosModal {
  isModalOpen: boolean = false;
  hasUploadedPhotos: boolean = false;

  constructor(
    public photosService: PhotosService,
    private router: Router
  ) {}

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files) return;
    const files = input.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        this.readFile(file);
      }
    }
    this.hasUploadedPhotos = true;
    // Navigate to Ta-da screen automatically after photos are uploaded
    this.router.navigate(['/listing-wizard/step2-3-3-photos-ta-da']);
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photosService.addPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number): void {
    this.photosService.removePhoto(index);
  }

  continueToTaDa(): void {
    this.closeModal();
    this.router.navigate(['/listing-wizard/step2-3-3-photos-ta-da']);
  }
}
