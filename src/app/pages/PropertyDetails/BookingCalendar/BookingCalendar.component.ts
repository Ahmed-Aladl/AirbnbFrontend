// في BookingCalendarComponent.ts
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DaterangepickerComponent,
  NgxDaterangepickerMd,
} from 'ngx-daterangepicker-material';
import {
  CalendarAvailabilityDto,
  CalendarAvailabilityService,
} from '../../../core/services/CalendarAvailability/calendar-availability.service';
import dayjs, { Dayjs } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/en';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { PropertyService } from '../../../core/services/Property/property.service';
import { map, Observable } from 'rxjs';
import { Result } from '../../../core/services/Wishlist/wishlist.service';
import { Property } from '../../../core/models/Property';
import { HttpRequest } from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { CommonPropInfoService } from '../../property-info/common-prop-info-service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

dayjs.extend(localeData);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export type range = { startDate: any; endDate: any };

@Component({
  selector: 'app-BookingCalendar',
  standalone: true,
  imports: [NgxDaterangepickerMd, FormsModule, CommonModule],
  templateUrl: './BookingCalendar.component.html',
  styleUrls: ['./BookingCalendar.component.css'],
})
export class BookingCalendarComponent implements OnInit, AfterViewInit {
  constructor(
    private calendarService: CalendarAvailabilityService,
    private property: PropertyService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private commonService: CommonPropInfoService,
    private snackBar: MatSnackBar,
    private elementRef: ElementRef
  ) { }

  private showToast(
    message: string,
    vertical: 'top' | 'bottom',
    horizontal: 'left' | 'right'
  ) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: horizontal,
      verticalPosition: vertical,
      panelClass: ['custom-snackbar'],
    });
  }

  @Input() propertyId!: number;
  @Input() checkIn?: dayjs.Dayjs;
  @Input() checkOut?: dayjs.Dayjs;
  @Output() dateSelected = new EventEmitter<{ start: string; end: string }>();
  @Output() datedChange = new EventEmitter<range>();
  @Input() dateMap?: Map<string, CalendarAvailabilityDto>;
  @Input() defaultPricePerNight?: number;

  @ViewChild('picker') picker!: DaterangepickerComponent;

  minDate = moment().startOf('year').format('YYYY-MM-DD');
  maxDate = moment().add(1, 'year').endOf('month').format('YYYY-MM-DD');

  showPicker = true;
  clickedDate?: dayjs.Dayjs;
  firstUnavailableDate?: dayjs.Dayjs;
  selected: { startDate?: dayjs.Dayjs; endDate?: dayjs.Dayjs } = {
    startDate: undefined,
    endDate: undefined,
  };

  locale = {
    format: 'YYYY-MM-DD',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    customRangeLabel: 'Custom',
  };

  selectedDateRange = {
    startDate: dayjs(),
    endDate: dayjs(),
  };

  totalPrice!: number;
  munavailableDates: string[] = [];
  private calendarObserver?: MutationObserver;

  ngOnInit(): void {
    this.commonService.clear$.subscribe(() => this.clear());
    this.selectedDateRange = { startDate: dayjs(), endDate: dayjs() };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.addPricesToCalendar();
      this.setupCalendarObserver();

      // Debug information
      this.debugCalendarData();
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let x = { startDate: undefined, endDate: undefined };

    if (changes['checkIn']) {
      if (this.selected) x.startDate = changes['checkIn'].currentValue;
    }
    if (changes['checkOut']) {
      if (this.selected) x.endDate = changes['checkOut'].currentValue;
    }

    this.selected = x;

    if (this.picker) {
      if (this.selected.startDate)
        this.picker.startDate = this.selected?.startDate;
      if (this.selected.endDate) this.picker.endDate = this.selected?.endDate;
      this.picker.updateView();
      this.picker.updateCalendars();
      this.picker.hide();
    }

    if (changes['dateMap'] && this.dateMap) {
      console.log('DateMap changed, updating prices');
      setTimeout(() => {
        this.addPricesToCalendar();
      }, 200);
    }
  }

  addPricesToCalendar(): void {
    if (!this.dateMap) return;

    setTimeout(() => {
      const calendarElement = this.elementRef.nativeElement.querySelector('.md-drppicker');
      if (!calendarElement) {
        console.warn('Calendar element not found');
        return;
      }

      const dateCells = calendarElement.querySelectorAll('td.available');
      // console.log(`Found ${dateCells.length} available date cells`);

      dateCells.forEach((cell: HTMLElement) => {
        try {
          const existingPrice = cell.querySelector('.date-price');
          if (existingPrice) {
            existingPrice.remove();
          }

          const dayText = cell.textContent?.trim();
          if (!dayText || isNaN(parseInt(dayText))) return;

          const calendarTable = cell.closest('table.table-condensed');
          if (!calendarTable) return;

          const monthHeader = calendarTable.querySelector('th.month');
          if (!monthHeader) return;

          const monthText = monthHeader.textContent?.trim();
          if (!monthText) return;

          let monthDate;
          try {
            monthDate = moment(monthText, ['MMMM YYYY', 'MMM YYYY']);
            if (!monthDate.isValid()) {
              console.warn(`Invalid month format: ${monthText}`);
              return;
            }
          } catch (error) {
            console.error(`Error parsing month: ${monthText}`, error);
            return;
          }

          const fullDate = monthDate.clone().date(parseInt(dayText));
          const dateKey = fullDate.format('YYYY-MM-DD');

          // console.log(`Processing date: ${dateKey}`);

          const availabilityData = this.dateMap!.get(dateKey);

          let price: number;
          let isSpecialPrice = false;

          if (availabilityData?.price) {
            price = availabilityData.price;
            isSpecialPrice = availabilityData.price !== this.defaultPricePerNight;
          } else {
            price = this.defaultPricePerNight || 0;
          }

          if (price > 0) {
            const priceElement = document.createElement('div');
            priceElement.className = 'date-price';
            priceElement.textContent = `$${price}`;

            if (isSpecialPrice) {
              priceElement.classList.add('special-price');
            }

            cell.appendChild(priceElement);

            console.log(`Added price ${price} for date ${dateKey} (special: ${isSpecialPrice})`);
          }

        } catch (error) {
          console.error('Error processing calendar cell:', error);
        }
      });
    }, 100);
  }

  private reapplyPrices(): void {
    setTimeout(() => {
      this.addPricesToCalendar();
    }, 50);
  }

  private debugCalendarData(): void {
    console.log('=== Calendar Debug Info ===');
    console.log('DateMap size:', this.dateMap?.size);
    console.log('Default price per night:', this.defaultPricePerNight);

    if (this.dateMap) {
      let count = 0;
      for (const [key, value] of this.dateMap.entries()) {
        if (count < 10) {
          console.log(`Date: ${key}, Price: ${value.price}, Available: ${value.isAvailable}`);
          count++;
        }
      }
    }

    const calendarElement = this.elementRef.nativeElement.querySelector('.md-drppicker');
    if (calendarElement) {
      const dateCells = calendarElement.querySelectorAll('td.available');
      console.log('Available date cells found:', dateCells.length);

      const priceElements = calendarElement.querySelectorAll('.date-price');
      console.log('Price elements found:', priceElements.length);
    }
  }

  private clearAllPrices(): void {
    const calendarElement = this.elementRef.nativeElement.querySelector('.md-drppicker');
    if (calendarElement) {
      const priceElements = calendarElement.querySelectorAll('.date-price');
      // priceElements.forEach(el => el.remove());
      priceElements.forEach((el: Element) => el.remove());
    }
  }

  private setupCalendarObserver(): void {
    const calendarElement = this.elementRef.nativeElement.querySelector('.md-drppicker');
    if (!calendarElement) return;

    this.calendarObserver = new MutationObserver((mutations) => {
      let shouldUpdatePrices = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const hasDateChanges = Array.from(mutation.addedNodes).some(node =>
            node instanceof Element && node.classList.contains('calendar-table')
          );

          if (hasDateChanges) {
            shouldUpdatePrices = true;
          }
        }
      });

      if (shouldUpdatePrices) {
        setTimeout(() => {
          this.addPricesToCalendar();
        }, 100);
      }
    });

    this.calendarObserver.observe(calendarElement, {
      childList: true,
      subtree: true
    });

    const prevButton = calendarElement.querySelector('.prev');
    const nextButton = calendarElement.querySelector('.next');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.reapplyPrices();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.reapplyPrices();
      });
    }
  }

  public forceUpdatePrices(): void {
    this.clearAllPrices();
    setTimeout(() => {
      this.addPricesToCalendar();
    }, 100);
  }

  onClear() {
    this.clear();
    this.commonService.clear();
  }

  clear() {
    console.log('clear');
    this.selected = {
      endDate: undefined,
      startDate: undefined,
    };
    this.picker.clear();
    this.cdr.detectChanges();
    this.datedChange.emit({
      startDate: this.selected.startDate,
      endDate: this.selected.startDate,
    });
  }

  // isInvalidDate = (date: dayjs.Dayjs): boolean => {
  //   if (date.isBefore(dayjs())) return true;
  //   if (this.dateMap) {
  //     return !(
  //       this.dateMap.get(date.toISOString().slice(0, 19))?.isAvailable ?? true
  //     );
  //   }
  //   return false;
  // };

  isInvalidDate = (date: dayjs.Dayjs): boolean => {
    if (date.isBefore(dayjs(), 'day')) return true;

    if (this.dateMap) {
      const dateKey = date.format('YYYY-MM-DD');
      const availabilityData = this.dateMap.get(dateKey);

      if (availabilityData && availabilityData.isAvailable === false) {
        return true;
      }
    }

    return false;
  };

  onStartDateChange(clickedDate: any) {
    this.clickedDate = clickedDate?.startDate ?? undefined;
    if (this.clickedDate) {
      let date;
      for (let i = 1; this.dateMap && i < this.dateMap.size; i++) {
        const nextDate = dayjs(this.clickedDate).add(i, 'day').format('YYYY-MM-DD');
        date = this.dateMap?.get(nextDate);

        if (date && !date.isAvailable) {
          this.firstUnavailableDate = dayjs(date.date);
          console.log('firstUnavailableDate', this.firstUnavailableDate);
          break;
        }
      }
    } else {
      this.firstUnavailableDate = undefined;
    }

    this.reapplyPrices();
  }

  onDateRangeSelected(range: { startDate: any; endDate: any }) {
    this.selected = {
      endDate: range?.endDate,
      startDate: range?.startDate,
    };
  }

  onDatesChanged(range: range) {
    this.datedChange.emit(range);

    this.reapplyPrices();
  }

  datesUpdated(range: any): void {
    const start = moment(range.startDate).format('YYYY-MM-DD');
    const end = moment(range.endDate).format('YYYY-MM-DD');

    const anyUnavailable = this.munavailableDates.some(
      (date) =>
        moment(date).isSameOrAfter(start) && moment(date).isSameOrBefore(end)
    );

    if (anyUnavailable) {
      console.warn('Selected range includes unavailable dates!');
      this.clearDates();
      this.showToast(
        'Some of the selected dates are unavailable. Please select different dates.',
        'bottom',
        'left'
      );
      return;
    }

    this.dateSelected.emit({ start, end });
  }

  clearDates(): void {
    this.selectedDateRange = { startDate: dayjs(), endDate: dayjs() };
  }

  ngOnDestroy(): void {
    if (this.calendarObserver) {
      this.calendarObserver.disconnect();
    }
  }
}
