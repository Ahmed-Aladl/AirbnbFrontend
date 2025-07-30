import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { Property } from '../../core/models/Property';
import { environment } from '../../../environments/environment.development';
import { SliderCard } from "../home/components/slider-card/slider-card";
import { CommonModule } from '@angular/common';
import { WishListModal } from "../../components/wish-list-modal/wish-list-modal";
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../core/services/dialog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wish-list-properties',
  templateUrl: './wishlist-properties.html',
  styleUrls: ['./wishlist-properties.css'],
  standalone: true,
  imports: [RouterModule, SliderCard, CommonModule, WishListModal]
})
export class WishListProperties implements OnInit {
  properties: Property[] = [];
  selectedPropertyId!: number;
  show = false;
  wishlistId!: number;
  wishlistName: string = '';


  onPropertyClick(id: number) {
    this.router.navigate(['/property', id])
  }
  // onWishlistClick(id:number){

  //   this.selectedPropertyId = id;
  //   this.show = !this.show;
  // }

  onWishlistClick(id: number) {
    if (!this.authService.userId) {
      this.showToast('Please log in to manage wishlist.', 'top', 'right');
      this.dialogService.openDialog('login');
      return;
    }

    this.removeFromWishlist(id);
  }


  removeFromWishlist(propertyId: number) {
    this.wishlistService.removePropertyFromWishlist(propertyId).subscribe({
      next: (success) => {
        if (success) {
          const property = this.properties.find(p => p.id === propertyId);
          this.properties = this.properties.filter(p => p.id !== propertyId);

          if (property) property.isFavourite = false;
          this.showToast('Property removed from wishlist', 'bottom', 'left');
        } else {

          this.showToast("Couldn't remove the property", 'bottom', 'left');
        }
      },
      error: (err) => {
        console.error('Error removing property:', err);

        this.showToast("Couldn't remove the property", 'bottom', 'left');
      }
    });
  }

  onFinish(observable: Observable<boolean>) {
    this.onClose();
    observable.subscribe({
      next: (success) => {
        if (success) {
          const property = this.properties.find(p => p.id === this.selectedPropertyId);
          if (property) property.isFavourite = true;

          this.showToast('Property added to wishlist', 'bottom', 'left');
        } else {
          this.showToast("Couldn't add the property", 'bottom', 'left');
        }
      },
      error: () => {
        this.showToast("Couldn't add the property", 'bottom', 'left');
      }
    });
  }

  private showToast(message: string, vertical: 'top' | 'bottom', horizontal: 'left' | 'right') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: horizontal,
      verticalPosition: vertical,
      panelClass: ['custom-snackbar']
    });
  }

  onClose() {
    this.show = false
  }



  goBack() {
    window.history.back();
  }

  constructor(
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
    private router: Router,
    public authService: AuthService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('wishlistId');
      if (id) {
        this.wishlistId = +id;
        this.fetchProperties();
      }
    });
  }

  trackByPropertyId(index: number, item: Property): number {
    return item.id;
  }

  isLoading: boolean = true;

  fetchProperties(): void {
    this.isLoading = true;
    this.wishlistService.getPropertiesInWishlist(this.wishlistId).subscribe(data => {
      this.properties = data.properties;
      this.wishlistName = data.name;
      this.isLoading = false;
      console.log('Wishlist:', this.wishlistName, 'Properties:', this.properties);
    }, err => {
      this.isLoading = false;
      console.error('Error loading wishlist properties', err);
    });
  }



  getPropertyImage(property: Property): string {
    const cover = property.images?.find(img => img.isCover && !img.isDeleted);

    if (cover?.imageUrl) {
      return `${environment.base}${cover.imageUrl}`;
    }

    return 'assets/images/deafult.png';
  }

}
