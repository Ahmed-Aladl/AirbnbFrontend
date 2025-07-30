import { AuthService } from './../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HostPropertiesService } from '../../core/services/Property/HostPropertiesService';
import { PropertyDisplayDTO } from '../../core/services/Property/HostPropertiesService';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../host-header/host-header";

@Component({
  selector: 'app-host-properties',
  standalone: true,
  templateUrl: './host-properties.html',
  styleUrls: ['./host-properties.css'],
  imports: [CommonModule, RouterLink, HeaderComponent]
})
export class HostProperties implements OnInit {
  properties: PropertyDisplayDTO[] = [];
  isLoading = true;
  error: string | null = null;
  viewMode: 'grid' | 'table' = 'grid';

  private hostId: string | null = null;

  constructor(
    private hostPropertiesService: HostPropertiesService,
    private router: Router,
    private authService: AuthService  
  ) {}

  ngOnInit(): void {
    
    this.hostId = this.authService.userId;
    this.loadHostProperties();
  }

  loadHostProperties(): void {
    // Check if hostId is available
    if (!this.hostId) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.hostPropertiesService.getPropertiesByHostId(this.hostId).subscribe({
      next: (properties) => {
        this.properties = properties;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load properties. Please try again later.';
        this.isLoading = false;
        console.error('Error loading properties:', err);
      }
    });
  }

  refreshProperties(): void {
    this.loadHostProperties();
  }

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }

  // Navigation methods
  navigateToEditProperty(propertyId: number): void {
    this.router.navigate(['/updatelist', propertyId.toString()]);
  }

  navigateToPropertyBookings(propertyId: number): void {
    this.router.navigate(['/propertybookings', propertyId.toString()]);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'action_required':
        return 'Action required';
      case 'in_progress':
        return 'In progress';
      case 'active':
        return 'Active';
      default:
        return 'Unknown';
    }
  }

  getCoverImageUrl(property: PropertyDisplayDTO): string {
    if (!property.images || property.images.length === 0) {
      return '';
    }

    const localCoverImage = property.images.find(img =>
      img.isCover && !img.isDeleted && (img.imageUrl.startsWith('/uploads/') || (!img.imageUrl.startsWith('http')))
    );

    if (localCoverImage) {
      return this.buildImageUrl(localCoverImage.imageUrl);
    }

    const coverImage = property.images.find(img => img.isCover && !img.isDeleted);
    if (coverImage) {
      return this.buildImageUrl(coverImage.imageUrl);
    }

    const firstLocalImage = property.images.find(img =>
      !img.isDeleted && (img.imageUrl.startsWith('/uploads/') || (!img.imageUrl.startsWith('http')))
    );

    if (firstLocalImage) {
      return this.buildImageUrl(firstLocalImage.imageUrl);
    }

    const firstImage = property.images.find(img => !img.isDeleted);
    if (firstImage) {
      return this.buildImageUrl(firstImage.imageUrl);
    }

    return '';
  }

  private buildImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';

    let staticBaseUrl = environment.baseUrl;
    if (staticBaseUrl.endsWith('/api')) {
      staticBaseUrl = staticBaseUrl.slice(0, -4);
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads/')) {
      const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      const baseUrl = staticBaseUrl.endsWith('/') ? staticBaseUrl : staticBaseUrl + '/';
      return `${baseUrl}${cleanImageUrl}`;
    }

    if (!imageUrl.startsWith('/')) {
      const baseUrl = staticBaseUrl.endsWith('/') ? staticBaseUrl : staticBaseUrl + '/';
      return `${baseUrl}uploads/${imageUrl}`;
    }

    const baseUrl = staticBaseUrl.endsWith('/') ? staticBaseUrl.slice(0, -1) : staticBaseUrl;
    return `${baseUrl}${imageUrl}`;
  }

  hasValidImage(property: PropertyDisplayDTO): boolean {
    return this.getCoverImageUrl(property) !== '';
  }
  
  trackById(index: number, property: any): string | number {
    return property.id;
  }
}