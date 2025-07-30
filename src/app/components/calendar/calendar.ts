import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  startOfDay
} from 'date-fns';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { HostPropertiesService } from '../../core/services/Property/HostPropertiesService';
import { PropertyDisplayDTO } from '../../core/models/PropertyDisplayDTO';
import { environment } from '../../../environments/environment.development';

export interface DayAvailability {
  date: Date;
  available: boolean;
  price: number;
  originalPrice?: number;
}

export interface CalendarSettings {
  viewType: 'month' | 'year';
  selectedDates: Date[];
  availability: DayAvailability[];
  minNights: number;
  maxNights: number;
}

interface ProcessedDay {
  date: Date;
  inCurrentMonth: boolean;
  isDisabled: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  price: number | null;
  dateKey: string;
}

interface ProcessedMonth {
  month: Date;
  days: ProcessedDay[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // very important for performance optimization
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() settings: CalendarSettings = {
    viewType: 'year',
    selectedDates: [],
    availability: [],
    minNights: 1,
    maxNights: 365,
  };

  @Output() dateSelected = new EventEmitter<Date[]>();
  @Output() settingsChanged = new EventEmitter<CalendarSettings>();

  currentYear = new Date().getFullYear();
  currentMonth = new Date();
  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Pre-processed data
  processedMonths: ProcessedMonth[] = [];
  processedCurrentMonth: ProcessedMonth | null = null;

  // Caches
  private availabilityMap = new Map<string, DayAvailability>();
  private selectedDatesSet = new Set<string>();
  private monthDaysCache = new Map<
    string,
    { date: Date; inCurrentMonth: boolean }[]
  >();

  showViewDropdown = false;
  tempViewType: 'month' | 'year' = 'year';
  showPropertyDropdown = false;
  // selectedProperty: String = '';

  ngOnInit() {
    this.currentYear = this.currentMonth.getFullYear();
    this.tempViewType = this.settings.viewType;
    this.updateCaches();
    this.processAllData();


    this.hostId = this.authService.userId;
    this.loadHostProperties();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['settings']) {
      this.updateCaches();
      this.processAllData();
    }
  }

  private updateCaches() {
    // Update availability map
    this.availabilityMap.clear();
    this.settings.availability.forEach((avail) => {
      this.availabilityMap.set(format(avail.date, 'yyyy-MM-dd'), avail);
    });

    // Update selected dates set
    this.selectedDatesSet.clear();
    this.settings.selectedDates.forEach((date) => {
      this.selectedDatesSet.add(format(date, 'yyyy-MM-dd'));
    });
  }

  private processAllData() {
    if (this.settings.viewType === 'year') {
      this.processedMonths = this.generateProcessedYearMonths();
    } else {
      this.processedCurrentMonth = this.generateProcessedMonth(
        this.currentMonth
      );
    }
  }

  private generateProcessedYearMonths(): ProcessedMonth[] {
    const months: ProcessedMonth[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(this.currentYear, i, 1);
      months.push(this.generateProcessedMonth(monthDate));
    }
    return months;
  }

  private generateProcessedMonth(monthDate: Date): ProcessedMonth {
    const monthKey = format(monthDate, 'yyyy-MM');

    // Get or generate month days
    let monthDays = this.monthDaysCache.get(monthKey);
    if (!monthDays) {
      const start = startOfWeek(startOfMonth(monthDate));
      const end = endOfWeek(endOfMonth(monthDate));
      monthDays = eachDayOfInterval({ start, end }).map((date) => ({
        date,
        inCurrentMonth: isSameMonth(date, monthDate),
      }));
      this.monthDaysCache.set(monthKey, monthDays);
    }

    // Process each day
    const processedDays: ProcessedDay[] = monthDays.map((day) => {
      const dateKey = format(day.date, 'yyyy-MM-dd');
      const availability = this.availabilityMap.get(dateKey);
      const today = startOfDay(new Date());

      const isDisabled = isBefore(day.date, today);
      const isAvailable = !isDisabled && (availability ? availability.available : true);
      const isSelected = this.selectedDatesSet.has(dateKey);
      const isHighlighted = this.calculateIsHighlighted(day.date);
      const price = availability ? availability.price : null;
      return {
        date: day.date,
        inCurrentMonth: day.inCurrentMonth,
        isDisabled,
        isAvailable,
        isSelected,
        isHighlighted,
        price,
        dateKey,
      };
    });


    return {
      month: monthDate,
      days: processedDays,
    };
  }

  private calculateIsHighlighted(date: Date): boolean {
    if (this.settings.selectedDates.length !== 2) return false;
    const [start, end] = this.settings.selectedDates.sort(
      (a, b) => a.getTime() - b.getTime()
    );
    return isAfter(date, start) && isBefore(date, end);
  }


  selectDate(date: Date) {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return;

    const index = this.settings.selectedDates.findIndex((d) =>
      isSameDay(d, date)
    );

    if (index > -1) {
      this.settings.selectedDates.splice(index, 1);
    } else {
      this.settings.selectedDates.push(date);
    }

    this.settings = {
      ...this.settings,
      selectedDates: [...this.settings.selectedDates],
    };

    // Update caches and reprocess data
    this.updateCaches();
    this.processAllData();

    this.dateSelected.emit(this.settings.selectedDates);
    this.settingsChanged.emit(this.settings);
  }

  previousMonth() {
    const prev = subMonths(this.currentMonth, 1);
    if (prev.getFullYear() === this.currentYear) {
      this.currentMonth = prev;
      if (this.settings.viewType === 'month') {
        this.processedCurrentMonth = this.generateProcessedMonth(
          this.currentMonth
        );
      }
    }
  }

  nextMonth() {
    const next = addMonths(this.currentMonth, 1);
    if (next.getFullYear() === this.currentYear) {
      this.currentMonth = next;
      if (this.settings.viewType === 'month') {
        this.processedCurrentMonth = this.generateProcessedMonth(
          this.currentMonth
        );
      }
    }
  }

  toggleViewType() {
    this.closeProperty();
    this.showViewDropdown = !this.showViewDropdown;
  }

  setViewType(type: 'month' | 'year') {
    this.tempViewType = type;
  }

  closeViewDropdown() {
    this.showViewDropdown = false;
  }

  toggleProperty() {
    this.closeViewDropdown();
    this.showPropertyDropdown = !this.showPropertyDropdown;
  }

  setProperty(id: string) {
    this.selectedPropertyId = id;
    this.closeProperty();
    this.propertySelected.emit(id);
  }

  closeProperty() {
    this.showPropertyDropdown = false;
  }

  applyViewType() {
    this.settings.viewType = this.tempViewType;
    this.showViewDropdown = false;
    this.processAllData(); // Re-process data when view changes
    this.settingsChanged.emit(this.settings);
  }

  // Helper methods for template
  format = format;

  trackByDate(index: number, day: ProcessedDay) {
    return day.dateKey;
  }

  trackByMonth(index: number, month: ProcessedMonth) {
    return format(month.month, 'yyyy-MM');
  }

  get canGoToPreviousMonth(): boolean {
    const prev = subMonths(this.currentMonth, 1);
    return prev.getFullYear() === this.currentYear;
  }

  get canGoToNextMonth(): boolean {
    const next = addMonths(this.currentMonth, 1);
    return next.getFullYear() === this.currentYear;
  }





  @Output() propertySelected = new EventEmitter<string>();
  properties: PropertyDisplayDTO[] = [];
  isLoading = true;
  error: string | null = null;
  private hostId: string | null = null;
  selectedPropertyId: string | null = null;
  constructor(
    private hostPropertiesService: HostPropertiesService,
    private router: Router,
    private authService: AuthService
  ) { }


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
        if (this.properties.length > 0) {
          this.selectedPropertyId = this.properties[0].id.toString();
          this.propertySelected.emit(this.selectedPropertyId);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load properties. Please try again later.';
        this.isLoading = false;
        console.error('Error loading properties:', err);
      }
    });
  }
  get selectedPropertyTitle(): string {
    const property = this.properties.find(p => p.id.toString() === this.selectedPropertyId);
    return property?.title || 'Select Property';
  }
  getPropertyImage(property: PropertyDisplayDTO): string {
    const cover = property.images?.find(img => img.isCover && !img.isDeleted);

    if (cover?.imageUrl) {
      return `${environment.base}${cover.imageUrl}`;
    }

    // fallback image
    return 'assets/images/deafult.png';
  }

}
