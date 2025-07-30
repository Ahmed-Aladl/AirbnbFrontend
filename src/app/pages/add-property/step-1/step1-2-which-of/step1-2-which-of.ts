import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormStorageService } from '../../../../core/services/ListingWizard/property-form-storage.service';
import { ListingWizardService } from '../../../../core/services/ListingWizard/listing-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step1-2-which-of',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step1-2-which-of.html',
  styleUrl: './step1-2-which-of.css',
})
export class Step12WhichOf implements OnInit, OnDestroy {
  private subscription!: Subscription;
  propertyTypes = [
    { name: 'House', icon: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png' },
    { name: 'apartment', icon: 'https://cdn-icons-png.flaticon.com/512/17306/17306200.png' },
    { name: 'Barn', icon: 'https://img.icons8.com/?size=100&id=11483&format=png&color=000000' },
    { name: 'Bed & breakfast', icon: 'https://cdn-icons-png.flaticon.com/512/676/676020.png' },
    { name: 'Boat', icon: 'https://img.icons8.com/?size=100&id=17857&format=png&color=000000' },
    { name: 'Cabin', icon: 'https://img.icons8.com/?size=100&id=wQqzfT1j8jJc&format=png&color=000000' },
    { name: 'Camper/RV', icon: 'https://cdn-icons-png.flaticon.com/512/1880/1880863.png' },
    { name: 'Casa particular', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM0A4GPV6PDQHc-fW_fsYFkF9Yl86dZWhPvg&s' },
    { name: 'Castle', icon: 'https://cdn-icons-png.flaticon.com/512/2717/2717310.png' },
    { name: 'Cave', icon: 'https://cdn-icons-png.flaticon.com/512/4423/4423268.png' },
    { name: 'Container', icon: 'https://img.icons8.com/?size=100&id=16796&format=png&color=000000' },
    { name: 'Cycladic home', icon: 'https://www.svgrepo.com/show/489294/cycladic-home.svg' },
    { name: 'Dammuso', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyiAfza-7cLz59seWbbnxdWJsS9mFdyqS_HQ&s' },
    { name: 'Dome', icon: 'https://png.pngtree.com/png-vector/20230421/ourmid/pngtree-dome-line-icon-vector-png-image_6718036.png' },
    { name: 'Earth home', icon: 'https://cdn-icons-png.flaticon.com/512/2701/2701479.png' },
    { name: 'Farm', icon: 'https://thumbs.dreamstime.com/b/black-line-icon-farm-land-ground-soil-earth-field-plot-farmland-169457723.jpg' },
    { name: 'Guesthouse', icon: 'https://www.svgrepo.com/show/489304/guest-house.svg' },
    { name: 'Hotel', icon: 'https://cdn-icons-png.flaticon.com/512/13061/13061464.png' },
    { name: 'Houseboat', icon: 'https://cdn-icons-png.flaticon.com/512/9041/9041775.png' },
    { name: 'Kezhan', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdGmgvGZHes8_OGPc4_n_uCy6bYRI6VAWzyA&s' },
    { name: 'Minsu', icon: 'https://www.svgrepo.com/show/489313/minsu.svg' },
    { name: 'Riad', icon: 'https://static.vecteezy.com/system/resources/previews/050/718/360/non_2x/simple-black-and-white-icon-of-a-moroccan-riad-building-with-plants-vector.jpg' },
    { name: 'Ryokan', icon: 'https://www.svgrepo.com/show/489320/ryokan.svg' },
    { name: 'Shepherd\'s hut', icon: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/shephers-hut-icon-download-in-svg-png-gif-file-formats--ryokan-japan-japanese-places-amenities-pack-user-interface-icons-11123693.png?f=webp&w=256' },
    { name: 'Tent', icon: 'https://img.icons8.com/?size=100&id=2574&format=png&color=000000' },
    { name: 'Tiny home', icon: 'https://img.icons8.com/?size=100&id=4xaQiLrwHm4L&format=png&color=000000' },
    { name: 'Tower', icon: 'https://static.thenounproject.com/png/251444-200.png' },
    { name: 'Treehouse', icon: 'https://static.thenounproject.com/png/1705999-200.png' },
    { name: 'Trullo', icon: 'https://www.svgrepo.com/show/489330/trullo.svg' },
    { name: 'Windmill', icon: 'https://img.icons8.com/?size=100&id=32429&format=png&color=000000' },
    { name: 'Yurt', icon: 'https://img.freepik.com/premium-vector/yurt-vector-illustration_1186366-53086.jpg' }
  ];

  selectedType: { name: string, icon: string } = this.propertyTypes[0] || { name: 'House', icon: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png' };

  constructor(
    private formStorage: PropertyFormStorageService,
    private wizardService: ListingWizardService
  ) {}

  ngOnInit(): void {
    // Load saved data
    const savedData = this.formStorage.getStepData('step1-2');
    if (savedData?.selectedType) {
      this.selectedType = savedData.selectedType;
    }

    // Subscribe to next step event
    this.subscription = this.wizardService.nextStep$.subscribe(() => {
      this.saveData();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  selectType(type: { name: string, icon: string }) {
    this.selectedType = type;
    this.saveData();
  }

  private saveData(): void {
    // Save to property_form_data in storage
    const data = {
      selectedType: this.selectedType
    };
    this.formStorage.saveFormData('step1-2', data);
  }
}