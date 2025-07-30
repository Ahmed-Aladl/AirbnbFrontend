import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { SliderCard } from "../../pages/home/components/slider-card/slider-card";
import { Property } from '../../core/models/Property';
import { environment } from '../../../environments/environment.development';

register();

@Component({
  selector: 'app-property-swiper',
  standalone: true,
  imports: [CommonModule, SliderCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mainswiper.html',
  styleUrls: ['./mainswiper.css']
})
export class PropertySwiperComponent implements OnInit {
  @Input() isLoading: boolean = false;
  @Input() title: string = '';
  @Input() slidesPerView: number = 3;


  @Output() propertyClicked = new EventEmitter<number>();
  @Output() wishlistIconClick = new EventEmitter<number>();

  onWishListClick(id: number) {
    this.wishlistIconClick.emit(id)
  }
  onCardClicked(id: number) {
    this.propertyClicked.emit(id);
  }

  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef;

  isBeginning = true;
  isEnd = false;


  breakpoints: any = {};
  @Input() properties: Property[] = [];

  ngOnInit(): void {
    this.breakpoints = {
      320: { slidesPerView: 1, spaceBetween: 12 },
      640: { slidesPerView: 2, spaceBetween: 16 },
      768: { slidesPerView: 3, spaceBetween: 16 },
      1024: { slidesPerView: this.slidesPerView, spaceBetween: 16 },
      1280: { slidesPerView: this.slidesPerView, spaceBetween: 16 }
    };


    setTimeout(() => {
      this.setupSwiperEvents();
    }, 100);
  }

  private setupSwiperEvents(): void {
    const swiperEl = this.swiperEl?.nativeElement;
    if (swiperEl) {
      swiperEl.addEventListener('swiperslidechange', () => {
        this.updateNavigationState();
      });

      swiperEl.addEventListener('swiperreachbeginning', () => {
        this.isBeginning = true;
      });

      swiperEl.addEventListener('swiperreachend', () => {
        this.isEnd = true;
      });

      swiperEl.addEventListener('swiperfrombeginning', () => {
        this.isBeginning = false;
      });

      swiperEl.addEventListener('swiperfromend', () => {
        this.isEnd = false;
      });
    }
  }

  private updateNavigationState(): void {
    const swiperEl = this.swiperEl?.nativeElement;
    if (swiperEl?.swiper) {
      this.isBeginning = swiperEl.swiper.isBeginning;
      this.isEnd = swiperEl.swiper.isEnd;
    }
  }

  slideNext(): void {
    const swiperEl = this.swiperEl?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideNext();
    }
  }

  slidePrev(): void {
    const swiperEl = this.swiperEl?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slidePrev();
    }
  }


  trackByPropertyId(index: number, property: Property): number {
    return property.id;
  }



  getPropertyImage(property: Property): string {
    const cover = property.images?.find(img => img.isCover && !img.isDeleted);

    if (cover?.imageUrl) {
      return `${environment.base}${cover.imageUrl}`;
    }

    // fallback image
    return 'assets/images/deafult.png';
  }
}