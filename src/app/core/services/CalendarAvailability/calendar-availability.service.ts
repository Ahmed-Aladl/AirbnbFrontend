import { Property } from './../../models/Property';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CalendarAvailability } from '../../models/CalendarAvailability';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import dayjs from 'dayjs';

// src/app/shared/models/calendar-check-availability.dto.ts

export interface CalendarCheckResponse {
  data: CalendarCheckData;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface CalendarCheckData {
  isAvailable: boolean;
  unavailableDates: string[];
  totalPrice: number;
  message: string;
}


export interface Result<T> {
   data: T;
  isSuccess: boolean;
  message: string;
  statusCode?: number;
}

export interface CalendarAvailabilityDto {
  date: string; 
  isAvailable: boolean;
  price: number;
}

@Injectable({    providedIn: 'root' })

@Injectable({
  providedIn: 'root',
})
export class CalendarAvailabilityService {

       private baseUrl = environment.baseUrl;
  private calendarUrl = `${this.baseUrl}/Calendar`;


      constructor(private http: HttpClient) {}

  getAvailability(
          propertyId: number,
          startDate: string,
          endDate: string
        ): Observable<CalendarAvailabilityDto[]> {
          const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

          const url = `${this.calendarUrl}/property/${propertyId}`;

          return this.http
            .get<Result<CalendarAvailabilityDto[]>>(url, { params })
            .pipe(map(res => res.data));
}

      // getSpecialPrice(
      //   Propertyid:string,
      //   startdateSelected:dayjs,
      //   enddateSelected:dayjs
      // ):Observable<CalendarAvailability[]>{
      //       const
      // }



      }

