import { Host } from './../../../layout/host/host';
import { Availability } from './../../availability-page/availability-page';
import { Message } from './../../../core/models/Message';
import { CommonPropInfoService } from './../../property-info/common-prop-info-service';
import { CommonModule } from '@angular/common';
import { Property } from './../../../core/models/Property'; // Assuming this path is correct
import { PropertyService } from './../../../core/services/Property/property.service';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, output, Output, ViewChild, viewChild, input, AfterViewInit } from '@angular/core';
import { BookingDTO, BookingService } from '../../../core/services/Booking/booking.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarAvailabilityDto, CalendarAvailabilityService } from '../../../core/services/CalendarAvailability/calendar-availability.service';
import { OnChanges, SimpleChanges } from '@angular/core';
import moment from 'moment';
import { range } from '../BookingCalendar/BookingCalendar.component';
import { DaterangepickerComponent, DaterangepickerDirective, NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
// import { DpDatePickerModule } from 'ng2-date-picker';
import dayjs, { Dayjs } from 'dayjs';
import { ChatService, ReservePropertyRequest } from '../../../core/services/Message/message.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PaymentService } from '../../../core/services/Payment/payment.service';
import { AuthService } from '../../../core/services/auth.service';


export interface EditReservePropertyRequest {
  propertyId: string;
  checkInDate: undefined;
  checkOutDate: undefined;
  guestCount: number;
  message: string;
   hostId: string;
}

@Component({
  selector: 'app-reverse-section',
  imports: [CommonModule, FormsModule,NgxDaterangepickerMd], 
  templateUrl: './reverse-section.component.html',
  styleUrls: ['./reverse-section.component.css']
})

export class ReverseSectionComponent implements OnInit ,OnChanges {
  
constructor(
  private propertyService: PropertyService,
  private bookingService: BookingService ,
  private calendarService: CalendarAvailabilityService,
  private cdr: ChangeDetectorRef,
  private commonService: CommonPropInfoService,
  private chatService: ChatService  ,
    private route: ActivatedRoute,  // used to read current route params
  private router: Router ,    
  private   paymentService :PaymentService,
  private auth :AuthService
) {}
  
    @Input() checkIn?: dayjs.Dayjs;
    @Input() checkOut?: dayjs.Dayjs;
    @Input() propertyId!: number;

    @Output() guestChange = new EventEmitter<{
        adults: number;
        children: number;
        // infants: number;
    }>();


    @Input() dateMap?: Map<string,CalendarAvailabilityDto>
    @Output() dateChange = new EventEmitter<range>()

    @Input() guests: {
        adults: number;
        children: number;
        // infants: number;
    } = { adults: 1, children: 0}; // Default values

    @ViewChild('picker',{read:DaterangepickerDirective}) picker!: DaterangepickerDirective;

    @ViewChild("element") elemnt!: any

    clickedDate?:dayjs.Dayjs
    firstUnavailableDate?:dayjs.Dayjs

    displayMonths = 2;

    @Input() hostID!: string;
    public Message: string = '';

@Output() reserveClicked = new EventEmitter<any>();

totalNights: number = 0;
showReservationMessage: boolean = false;

specialPriceFromAvailable !:any;


ngOnInit() {
  this.commonService.clear$.subscribe(()=>{this.clear()})
    console.log("from ReserveOnInit",this.checkIn,this.checkOut)
    console.log("property id ",this.propertyId)
    console.log("host id ",this.hostID)
    this.selected = {
      startDate: undefined,
      endDate: undefined
    }
    console.log("selected dates from on init reserve component  " , this.selected.startDate , "and " ,this.selected.endDate)
    // this.picker.nativeElement.nextElementSibling
    // console.log("this.picker.nativeElement.nextElementSibling",this.picker)
    // console.log("this.picker.nativeElement.nextElementSibling",this.elemnt)
      if (!this.propertyId) {
        console.error('Property ID is required for ReverseSectionComponent');
      }
      this.propertyService.getPropertyById(this.propertyId).subscribe({
        next: (property: Property) => {
          this.property = property;
          this.maxGuests = property.maxGuests;
          this.pricePerNight=property.pricePerNight;
          this.hostID=property.hostId;

          console.log("price per neight " ,this.pricePerNight) // ✅ update maxGuests from backend
        },
        error: (err) => {
          console.error('Failed to load property data', err);
        }
      });

      // this.calendarService.getAvailability(this.propertyId, toString(this.selected.startDate?),this.selected.endDate)
      
      // this.generateCalendarDays();
      console.log("form reserve-section onInit")
    console.log("selected dates from on init reserve component  " , this.selected.startDate , "and " ,this.selected.endDate)

    }
    // this.onReserveClick();


  onReserveClick() {
  console.log("reserve clicked here ")
  const queryParams  = {
    propertyId: this.propertyId,
    hostId: this.hostID,
    checkIn: this.selected.startDate,
    checkOutDate: this.checkOutDate,
    guestCount: this.guests,
    totalPrice: this.totalPrice,
    // message: this.Message
  };
  console.log("property id",this.property.id )
  console.log("host id",this.hostID )

  console.log("check in ",this.checkInDate )
  console.log("check out ",this.checkOutDate )
  console.log("Number of guests ",this.guestCount )
  console.log("total price ",this.totalPrice )


    // this.http.post<{ sessionUrl: string }>('https://your-api.com/api/stripe/create-checkout-session', body)
    // .subscribe({
    //   next: (res) => {
    //     const stripe = Stripe('your-publishable-key'); 
    //     stripe.redirectToCheckout({ sessionId: res.sessionUrl });
    //   },
    //   error: (err) => {
    //     console.error('Stripe checkout error:', err);
    //   }
    // });

  
  this.router.navigate(
    [`/host-contact/${this.propertyId}/${this.hostID}`],
    { queryParams  }
  );
}

ngOnChanges(changes: SimpleChanges): void {

      if(changes['checkIn'] && changes['checkOut'])
      this.selected= {startDate:changes['checkIn'].currentValue,endDate:changes['checkOut'].currentValue}


  // console.log("this.picker.nativeElement.nextElementSibling",this.picker)
    // console.log("this.picker.nativeElement.nextElementSibling",this.elemnt)
    // let x = {startDate:undefined,endDate:undefined}
    //   if (changes['checkIn']) {
    //     console.log('checkIn input changed:', this.checkIn);
    //     x.startDate = changes['checkIn'].currentValue

    //         // this.selected.startDate = moment(this.checkIn);
    //   }
    //   if (changes['checkOut']) {
    //     x.endDate = changes['checkOut'].currentValue
        
    //     console.log('checkOut input changed:', this.checkOut);
    //   }


      console.log(this.selected.startDate ," fom on changes in reserve section",this.selected.endDate)
      // console.log(this.picker)
      this.picker.hide()


      // this.onDatesChanged(x);
      this.checkAvailabilityForSelectedRange();
      // this.picker.nativeElement.nextElementSibling.setStartDate( dayjs(x.startDate.toDate()));
      // this.picker.nativeElement.nextElementSibling.setEndDate( dayjs(x.endDate.toDate()));
  }

  @HostListener('window:resize', [])
  onResize() {
    this.updateDisplayMonths();
  }

  isInvalidDate = (date: dayjs.Dayjs): boolean => {
    // console.log("selected start date is ", this.selected.startDate)
    // if(this.clickedDate ){
    //   if(date.isBefore(this.clickedDate))
    //     return true
    //   if(!this.firstUnavailableDate)
    //     return false
    //   if(date.isBefore(this.firstUnavailableDate))
    //     return false
    //   return true
    // }

    if(date.isBefore(dayjs()))
      return true
    if(this.dateMap)
    {
      // if( !(this.dateMap.get(date.toString())?.isAvailable?? true))
        // console.log(date, (this.dateMap.get(date.toISOString().slice(0,19))?.isAvailable))
      return  !(this.dateMap.get(date.toISOString().slice(0,19))?.isAvailable?? true)
    }
    // .some(d => dayjs(d.date).isSame(date, 'day') && d.isAvailable )
    return false
    
  }

  onStartDateChange(clickedDate:any){
    // this.selected = {
    //   startDate:undefined,
    //   endDate:undefined
    // }

    // this.onDatesChanged(this.selected);
    // this.onClear();

    // this.clickedDate = clickedDate?.startDate?? undefined
    // if(this.clickedDate)
    // {
    //   let date ;
    //   for(let i=1;  this.dateMap && i < this.dateMap.size  ;i++)
    //   {
    //     date =  this.dateMap?.get( dayjs(this.clickedDate)
    //                                     .add(i,"day")
    //                                     .toISOString().slice(0,19)
    //                           ) 

    //     if(date && !date.isAvailable){
    //         this.firstUnavailableDate = dayjs(date.date)
    //         console.log("firstUnavailableDate",this.firstUnavailableDate)
    //         break;
    //     }
    //   }
    // }else
    //   this.firstUnavailableDate = undefined
  }

  onClear(){
    this.clear()
    this.commonService.clear()
    
  }
  clear(){
    console.log("clear")
    this.selected = {
      endDate :undefined,
      startDate: undefined 
    }         
    this.picker.picker.clear()
    
    this.dateChange.emit({startDate:this.selected.startDate,endDate:this.selected.startDate})

  }
  updateDisplayMonths() {
    this.displayMonths = window.innerWidth < 768 ? 1 : 2;
  }
    selected: { startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs } = {startDate:undefined,endDate:undefined};


      ranges: any = {
        Today: [moment().add(1,"month"), moment().add(1,"month")],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
          moment().subtract(1, 'month').startOf('month'),
          moment().subtract(1, 'month').endOf('month')
        ]
      };

      locale = {
        format: 'YYYY-MM-D',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        customRangeLabel: 'Custom'
      };
    
      selectedDateRange = {
        startDate: null as string | null,
        endDate: null as string | null
    
      };
    

    property: any;
    maxGuests!:number; 
    totalPrice: any;
    guestCount: number = 1;
    pricePerNight: number = 120; //test
    errorMessage: string | null = null;
    checkInDate: Date | null = null;
    checkOutDate: Date | null = null;
    showGuestDropdown = false;

    isDateRangeAvailable: boolean | null = null;
    unavailableDates: string[] = [];
  
  onDatesChanged(range:range){
    this.firstUnavailableDate = undefined
    this.clickedDate = undefined
    this.dateChange.emit(range)
    // this.picker.clear()
    console.log("on dates changes " ,range)
    console.log("on date changed ", this.clickedDate)

  this.calculateTotalPrice();

  }


  // Calendar properties
  currentMonth: Date = new Date(); 
  weekDays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  currentMonthDays: any[] = [];
  nextMonthDays: any[] = [];
  showNextMonth: boolean = true; // Always show next month as per image




findClosestAvailableRange(start: Date, allDays: any[]): { start: Date, end: Date } {
  const sorted = allDays
    .filter(d => d.date && d.available)
    .sort((a, b) => +a.date - +b.date);

  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i].date;
    const next = sorted[i + 1].date;
    const diff = (next.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      return { start: curr, end: next };
    }
  }

  return { start: start, end: start };
}


    isSameDay(d1: Date, d2: Date): boolean {
      return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    // validateDateRange(start: Date, end: Date): boolean {
    //   const allDays = [...this.currentMonthDays, ...this.nextMonthDays];
    //   for (let day of allDays) {
    //     if (day.date && day.date > start && day.date < end && day.disabled) {
    //       return false;
    //     }
    //   }
    //   return true;
    // }


    isCheckIn(date: Date): boolean {
      // console.log(" date that is parameter to ischeckin",date);
      return this.checkInDate ? this.isSameDay(this.checkInDate, date) : false;
      console.log("checkin date ", this.checkInDate)

    }

    isCheckOut(date: Date): boolean {
      console.log(" date that is parameter to ischeck out",date);

      return this.checkOutDate ? this.isSameDay(this.checkOutDate, date) : false;
    }

    toggleGuestDropdown(): void {
        this.showGuestDropdown = !this.showGuestDropdown;
      }

  get totalGuests(): string {
    const total = this.guests.adults + this.guests.children;
    let text = `${total} guest${total !== 1 ? 's' : ''}`;
    // if (this.guests.infants > 0) {
    //   text += `, ${this.guests.infants} infant${this.guests.infants !== 1 ? 's' : ''}`;
    // }
    return text;
  }


  updateGuests(type: 'adults' | 'children', delta: number): void {
  const currentCount = this.guests[type];
  const newCount = currentCount + delta;
console.log(currentCount);
  // Prevent going below limits of max in property
  if ((type === 'adults' && newCount < 1) || (type === 'children' && newCount < 0)) {
    return;
  }
  // Calculate new total guest count after applying delta
  const newGuestTotals = {
    ...this.guests,
    [type]: newCount
  };
  this.calculateTotalPrice();
  const totalGuests = newGuestTotals.adults + newGuestTotals.children;
  // Check if total exceeds max allowed
  if (totalGuests > this.maxGuests) {
    this.errorMessage = `Maximum ${this.maxGuests} guests allowed (excluding infants).`;
    return;
  }
  
  console.log(totalGuests);

  //  Only update guest data after validation
  this.guests = newGuestTotals;
  this.guestCount = totalGuests;
  this.errorMessage = null;
  this.guestChange.emit(this.guests);

  // ✅ Recalculate price after updating data
  this.calculateTotalPrice();
  console.log("💰 Total price recalculated: ", this.totalPrice);
}



calculateTotalPrice(): void {
  if (!this.selected?.startDate || !this.selected?.endDate) return;

  const start = dayjs(this.selected.startDate);
  const end = dayjs(this.selected.endDate);
  const numberOfNights = end.diff(start, 'day');
  if (numberOfNights <= 0) {
    this.totalPrice = 0;
    return;
  }
  const guestCount = (this.guests?.adults || 0) + (this.guests?.children || 0);
  console.log(guestCount);

  let totalNightly = 0;
  // for (let d = start; d.isBefore(end); d = d.add(1, 'day')) {
  //   const dateStr = d.format('YYYY-MM-DD');
  //   const matchedDay = this.availability?.find(day => day.date === dateStr);
  //   const priceForDay = matchedDay?.price ?? this.property.pricePerNight;
  //   totalNightly += priceForDay;
  // }
      const BasePrice = numberOfNights *this.pricePerNight;
console.log("number of neights  from total price " ,numberOfNights)
  this.totalPrice = BasePrice * guestCount;

  console.log("💰 Total price recalculated   print :", this.totalPrice);
}


  message?:string;



checkAvailabilityForSelectedRange(): void {

      console.log("reserve button clicked ");
      console.log(" elected range ",this.selected);
    const startDate = dayjs(this.selected.startDate);
    const endDate = dayjs(this.selected.endDate);
      console.log("before format " ,startDate)
      console.log("before format " ,endDate)
    const formattedStart = startDate.format('YYYY-MM-DD');
    const formattedEnd = endDate.format('YYYY-MM-DD');
      console.log("format start" ,formattedStart)
      console.log("format end" ,formattedEnd)


    const guestCount = (this.guests?.adults || 0) + (this.guests?.children || 0);
    console.log(guestCount);
      const clicked =dayjs(this.clickedDate).format('YYYY-MM-DD');

    // this.calendarService.getAvailability(this.propertyId, formattedStart, formattedEnd).subscribe((availability: CalendarAvailabilityDto[]) => {
    // const allAvailable = availability.every(day => day.isAvailable);
    // this.isDateRangeAvailable = allAvailable;

      // if(startDate ==undefined || endDate == undefined) return;

      this.calculateTotalPrice(); // assumes this.totalPrice is calculated
      let userId=this.auth.userId;

      if(!userId){
        console.log("there is no userid") //login
        return;
      }
        let bookingDTO: BookingDTO = {
          propertyId: this.propertyId,
          userId:userId,
          checkInDate: startDate.toDate().toUTCString(),
          checkOutDate: endDate.toDate().toUTCString(),
          numberOfGuests: guestCount,
        };
        
    this.bookingService.createBooking(bookingDTO).subscribe(bookingRes => {
        console.log("booking result" ,bookingRes);
      
      const bookingId = bookingRes.data.id;
      const totalAmount = bookingRes.data.totalPrice;

      this.paymentService.createCheckoutSession(bookingId, totalAmount, 'usd').subscribe({
        next: (res) => {
          console.log("payment service ",res);

          window.location.href = res.data.checkoutUrl;

        },
        error: (err) => {
          console.error("Checkout session creation failed", err);
        }
      });

});


}









}

