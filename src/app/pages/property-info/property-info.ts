import { Property } from './../../core/models/Property';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PropertyService } from '../../core/services/Property/property.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { PropertImageGalaryComponent } from "../PropertyDetails/propertImage-galary/propertImage-galary.component";
import { ReverseSectionComponent } from "../PropertyDetails/reverse-section/reverse-section.component";
import { AmenitiesSectionComponent } from '../PropertyDetails/amenities-section/amenities-section.component';
import { BookingCalendarComponent, range } from "../PropertyDetails/BookingCalendar/BookingCalendar.component";
import { MapLocationComponent } from "../PropertyDetails/mapLocation/mapLocation.component";
import { GuestReviews } from "../../components/guest-reviews/guest-reviews";
import moment from 'moment';
import dayjs from 'dayjs';
import { CalendarAvailabilityDto, CalendarAvailabilityService } from '../../core/services/CalendarAvailability/calendar-availability.service';

// interface CalendarAvailability{
//   price:number;
//   isAvailable:boolean
//   date:dayjs.Dayjs
// }
@Component({
  selector: 'app-property-info',
  imports: [CommonModule, PropertImageGalaryComponent, ReverseSectionComponent, AmenitiesSectionComponent, BookingCalendarComponent, MapLocationComponent, GuestReviews],
  templateUrl: './property-info.html',
  styleUrl: './property-info.css'
})



export class PropertyInfo implements OnInit {

  // properties: Property[] = [];
  selectedProperty: Property | undefined;
  isLoading = true;
  error: string | null = null;
  firstCalendarDate = dayjs().add(-5,'months')
  lastCalendarDate =  dayjs().add(1,'year')
  availability!: CalendarAvailabilityDto[]
  dateMap?: Map<string,CalendarAvailabilityDto> 
//to link reverse with calender 
    propertyId!: number;
    selectedDates! :{ start?: dayjs.Dayjs, end?:dayjs.Dayjs };
    guestCount = {
      adults: 1,
      children: 0,
      // infants: 0
  }

  hostID! :string;
  
  


    @Input() checkIn!: string;
    @Input() checkOut!: string;
    @Input() guests!: { adults: number, children: number, infants: number };

      @Output() guestChange = new EventEmitter<{
        adults: number;
        children: number;
        infants: number;
      }>();


  // State for child components
  activeTab: 'gallery' | 'reviews' | 'amenities' = 'gallery';
  property: any;

  constructor(
      private propertyService: PropertyService,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      private calendarService: CalendarAvailabilityService,
      private router: Router,
    ) {}
    
    ngOnInit(): void {
      this.selectedDates={
        start: undefined,
        end: undefined
      }
      this.route.params.subscribe(params => {
      this.propertyId = +params['propertyId']; // Get propertyId from route params
      if(this.propertyId <= 0) {
        this.error = 'Invalid property ID';
        this.isLoading = false;
        return;
      }
      // console.log('Property ID from route:', this.propertyId);
      this.showPropertyDetails(this.propertyId);
      this.getCalendarAvailability()

    });
  }
  
  getCalendarAvailability(){
    this.calendarService.getAvailability(
            this.propertyId,
            this.firstCalendarDate.toString(),
            this.lastCalendarDate.toString()
          ).subscribe({
            next:(res)=>{
              console.log("getCalendarAvailability",res)
              console.log("date.toString",dayjs().toISOString())
              this.availability = res;
              const dateMap = new Map<string, CalendarAvailabilityDto>();

                res.forEach(item => {
                  dateMap.set(item.date.slice(0,19), item);
                });
                console.log(dateMap)
              this.dateMap = dateMap;
              this.cdr.detectChanges()
            },
            error:()=>{}
          })

  }


  showPropertyDetails(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.hostID=property.hostId;
        this.selectedProperty = property;
        
        console.log('Selected property:', this.selectedProperty);
        console.log(id);
        this.cdr.detectChanges()

      },
      error: (err) => {
        this.error = 'Failed to load property details';
        console.error(err);
      }
    });
  }


   changeTab(tab: 'gallery' | 'reviews' | 'amenities'): void {
    this.activeTab = tab;
  }


onGuestUpdate(type: 'adults' | 'children' | 'infants', delta: number) {
  this.guests[type] += delta;
  this.guestChange.emit(this.guests);
}


isInvalidDate = (date: dayjs.Dayjs): boolean => {
  return (
    this.availability.some(d => dayjs(d.date).isSame(date, 'day') && d.isAvailable )

  );
};

customClasses = (date: dayjs.Dayjs): string => {
  if (this.availability.some(d => dayjs(d.date).isSame(date, 'day') && d.isAvailable )) {
    return 'blocked-line';
  }
  return ''; // no class for normal blocked dates
};


//  onDateSelected(range: { start: string; end: string }) {
//     this.selectedDates = {
//       start: range.start,
//       end: range.end
//     };
//   }

  // Handle guest update from Reverse Section
  onGuestChange(updatedGuests: { adults: number; children: number }) {
    this.guestCount = updatedGuests;
  }


  onDateChange(range:range){
    // console.log("from the parent's onDateChange", range)
    this.selectedDates.start =  range?.startDate//moment(range?.startDate?.toDate())
    this.selectedDates.end=  range.endDate//moment(range?.endDate?.toDate())
    
    // this.cdr.detectChanges()
    
  }

}