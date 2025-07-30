import { Observable } from 'rxjs';
import { ConfirmService } from './../../core/services/confirm.service';
import { CommonModule } from '@angular/common';
import { Component, resource } from '@angular/core';
import { WishListModal } from "../../components/wish-list-modal/wish-list-modal";
import { PropertySwiperComponent } from "../../components/mainswiper/mainswiper";
import { Property } from '../../core/models/Property';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/Property/property.service';
import { Router } from '@angular/router';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  imports: [CommonModule, WishListModal, PropertySwiperComponent, FormsModule],

  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  properties: Property[] = [];
  selectedPropertyId!: number;
  show = false;
  isLoading = false;

  constructor(
    private confirm: ConfirmService,
    private propertyService: PropertyService,
    private router: Router,
    private wishlistService: WishlistService,
    public authService: AuthService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.sections = this.shuffleArray(this.sections);
    this.loadAllSections();

  }

  sections = [
    { title: 'Popular homes in Cairo', search: { country: 'Egypt', city: 'Cairo' } },
    { title: 'Available in Hurghada next weekend', search: { country: 'Egypt', city: 'Hurghada', startDate: this.getNextWeekend() } },
    { title: 'Stay in New Cairo', search: { country: 'Egypt', city: 'New Cairo' } },
    { title: 'Available next month in Dubai', search: { country: 'UAE', city: 'Dubai', startDate: this.getNextMonth() } },
    { title: 'Homes in Ain Sokhna', search: { country: 'Egypt', city: 'Ain Sokhna' } },
    { title: 'Available in Alexandria next weekend', search: { country: 'Egypt', city: 'Alexandria', startDate: this.getNextWeekend() } },
    { title: 'Places to stay in Paris', search: { country: 'France', city: 'Paris' } },
    { title: 'Check out homes in Milan', search: { country: 'Italy', city: 'Milan' } },
    { title: 'Popular homes in Sheikh Zayed City', search: { country: 'Egypt', city: 'Sheikh Zayed City' } },
    { title: 'Stay in Barcelona', search: { country: 'Spain', city: 'Barcelona' } },
  ];

  getNextWeekend(): string {
    const today = new Date();
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + ((6 - today.getDay()) % 7));
    return nextSaturday.toISOString();
  }

  getNextMonth(): string {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString();
  }

  sectionProperties: { title: string; properties: Property[]; isLoading: boolean; slidesPerView: number }[] = [];
  getRandomSlidesCount(): number {
    const options = [5, 6, 7];
    return options[Math.floor(Math.random() * options.length)];
  }

  shuffleArray<T>(array: T[]): T[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }


  loadAllSections() {
    this.sections.forEach((section, index) => {
      this.sectionProperties.push({
        title: section.title,
        properties: [],
        isLoading: true,
        slidesPerView: this.getRandomSlidesCount()
      });

      this.propertyService.searchProperties(section.search).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.sectionProperties[index].properties = res.data.items;
          }
          this.sectionProperties[index].isLoading = false;
        },
        error: () => {
          this.sectionProperties[index].isLoading = false;
        }
      });
    });
  }


  onPropertyClick(id: number) {
    this.router.navigate(['/property', id])
  }
  // onWishlistClick(id:number){

  //   this.selectedPropertyId = id;
  //   this.show = !this.show;
  // }

  onWishlistClick(id: number) {
    if (!this.authService.userId) {
      this.showToast('Please log in to add to wishlist.', 'top', 'right');
      this.dialogService.openDialog('login');
      return;
    }

    let foundProperty: Property | undefined;

    for (let section of this.sectionProperties) {
      const prop = section.properties.find(p => p.id === id);
      if (prop) {
        foundProperty = prop;
        break;
      }
    }

    if (foundProperty?.isFavourite) {
      this.removeFromWishlist(id);
    } else {
      this.selectedPropertyId = id;
      this.show = true;
    }
  }


  removeFromWishlist(propertyId: number) {
    this.wishlistService.removePropertyFromWishlist(propertyId).subscribe({
      next: (success) => {
        if (success) {
          for (let section of this.sectionProperties) {
            const property = section.properties.find(p => p.id === propertyId);
            if (property) {
              property.isFavourite = false;
            }
          }
          this.showToast('Property removed from wishlist', 'bottom', 'left');
        } else {
          this.showToast("Couldn't remove the property", 'bottom', 'left');
        }
      },
      error: () => {
        this.showToast("Couldn't remove the property", 'bottom', 'left');
      }
    });
  }


  onFinish(observable: Observable<boolean>) {
    this.onClose();
    observable.subscribe({
      next: (success) => {
        if (success) {
          for (let section of this.sectionProperties) {
            const property = section.properties.find(p => p.id === this.selectedPropertyId);
            if (property) {
              property.isFavourite = true;
            }
          }

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


  // loadProperties() {
  //   this.isLoading = true;
  //   this.propertyService.searchProperties({}).subscribe({
  //     next: (response) => {

  //       if (response.isSuccess) {
  //         this.properties = response.data.items;
  //       }

  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('❌ API Error:', err);
  //       this.isLoading = false;
  //     },
  //   });
  // }

  onClose() {

    this.show = false
  }




}
