import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


export interface Result<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface CreatePaymentDTO {
  bookingId: number;
  amount: number;
  currency?: string; 
}

@Injectable({
  providedIn: 'root'
})


export class PaymentService {
  
  private readonly apiUrl = `${environment.baseUrl}/payment`;

  constructor(private http: HttpClient

  ) {}

 createCheckoutSession(
  bookingId: number,
  totalAmount: number,
  currency: string
): Observable<{ data: { checkoutUrl: string } }> {
  return this.http.post<{ data: { checkoutUrl: string } }>(
    `${this.apiUrl}/create-checkout-session`,
    {
      bookingId,
      amount: totalAmount,
      currency: currency
    }
  );
}


  


}
