import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export interface PricingSettings {
  basePrice: number;
  customWeekendPrice?: number;
  smartPricingEnabled: boolean;
  currency: string;
}

export interface AvailabilitySettings {
  minNights: number;
  maxNights: number;
  advanceNotice: 'same-day' | '1-day' | '2-days' | '3-days' | '7-days';
  sameDayNoticeTime: string;
  preparationTime: 'none' | '1-hour' | '2-hours' | '1-day';
  availabilityWindow: string;
  checkInDays: string[];
  checkOutDays: string[];
}

export interface CalendarFullSettings {
  pricing: PricingSettings;
  availability: AvailabilitySettings;
}

@Component({
  selector: 'app-calendar-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-settings.html',
  styleUrls: ['./calendar-settings.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarSettingsComponent implements OnInit, OnDestroy {

  selectedBlockOption: 'open' | 'blocked' = 'open';
  @Input() selectedDatePrice: number = 0;
  @Output() priceChanged = new EventEmitter<number>();
  @Output() saveChanges = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();

  setBlockOption(option: 'open' | 'blocked') {
    this.selectedBlockOption = option;
    this.availabilityModeChanged.emit(option);
    console.log('Selected block option:', option);
  }

  constructor(private cd: ChangeDetectorRef) { }

  @Input() settings: CalendarFullSettings = {
    pricing: {
      basePrice: 37,
      customWeekendPrice: undefined,
      smartPricingEnabled: false,
      currency: 'USD',
    },
    availability: {
      minNights: 1,
      maxNights: 365,
      advanceNotice: 'same-day',
      sameDayNoticeTime: '12:00',
      preparationTime: 'none',
      availabilityWindow: '12 months in advance',
      checkInDays: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      checkOutDays: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
    },
  };

  @Input() showBlockOptions = false;
  @Output() settingsChanged = new EventEmitter<CalendarFullSettings>();
  @Output() blockOptionsToggled = new EventEmitter<boolean>();

  activeTab: 'pricing' | 'availability' = 'pricing';

  private settingsUpdateSubject = new Subject<CalendarFullSettings>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.settingsUpdateSubject
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(settings => {
        this.settingsChanged.emit(settings);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'pricing' | 'availability') {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
  }

  onSettingsChange() {
    if (this.selectedPropertyId) {
      this.settingsUpdateSubject.next(this.settings);
    }
  }

  onPriceInputChange(newPrice: number) {
    this.selectedDatePrice = newPrice;
    this.priceChanged.emit(newPrice);
  }

  onSaveChanges() {
    this.saveChanges.emit();
  }

  onClearSelection() {
    this.clearSelection.emit();
  }

  // Block options methods
  toggleBlockOptions() {
    this.showBlockOptions = !this.showBlockOptions;
    this.cd.markForCheck();
    this.blockOptionsToggled.emit(this.showBlockOptions);
  }

  closeBlockOptions() {
    this.showBlockOptions = false;
    this.blockOptionsToggled.emit(false);
  }

  blockNight() {
    console.log('Block night');
    this.closeBlockOptions();
  }

  addCustomTripLength() {
    console.log('Add custom trip length');
    this.closeBlockOptions();
  }

  addPrivateNote() {
    console.log('Add private note');
    this.closeBlockOptions();
  }

  addCustomWeekendPrice() {
    this.settings.pricing.customWeekendPrice = this.settings.pricing.basePrice;
    this.onSettingsChange();
  }

  removeCustomWeekendPrice() {
    this.settings.pricing.customWeekendPrice = undefined;
    this.onSettingsChange();
  }

  trackByIndex(index: number): number {
    return index;
  }

  @Input() selectedPropertyId: string | null = null;
  @Output() availabilityModeChanged = new EventEmitter<'open' | 'blocked'>();

  onAvailabilityModeChange() {
    this.availabilityModeChanged.emit(this.selectedBlockOption);
  }
}
