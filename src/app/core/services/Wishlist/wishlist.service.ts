import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable, map } from 'rxjs';
import { Wishlist } from '../../models/Wishlist';
import { Property } from '../../models/Property';

export interface Result<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}
export interface WishlistWithPropertiesDTO {
  id: number;
  name: string;
  notes?: string;
  properties: Property[];
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly baseUrl = environment.baseUrl + '/wishlist';

  constructor(private http: HttpClient) {}

  getAllWishlists(): Observable<Wishlist[]> {
    return this.http
      .get<Result<Wishlist[]>>(this.baseUrl)
      .pipe(map((response) => response?.data ?? []));
  }
  getByUserIdWithCover(id: string): Observable<Result<Wishlist[]>> {
    return this.http.get<Result<Wishlist[]>>(this.baseUrl);
  }

  createNewWishlist(wishlist: {
    name: string;
    notes: string;
    propertyIds: number[];
  }): Observable<Result<Wishlist>> {
    return this.http.post<Result<Wishlist>>(`${this.baseUrl}/create`, wishlist);
  }

  deleteWishlist(id: number): Observable<boolean> {
    return this.http
      .delete<Result<boolean>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.isSuccess));
  }

  addPropertyToWishlist(
    wishlistId: number,
    propertyId: number
  ): Observable<boolean> {
    return this.http
      .post<Result<boolean>>(
        `${this.baseUrl}/add/${wishlistId}/${propertyId}`,
        {}
      )
      .pipe(map((response) => response.isSuccess));
  }

  removePropertyFromWishlist(
    propertyId: number
  ): Observable<boolean> {
    return this.http
      .delete<Result<boolean>>(
        `${this.baseUrl}/remove-favorite/${propertyId}`
      )
      .pipe(map((response) => response.isSuccess));
  }

  getPropertiesInWishlist(
    wishlistId: number
  ): Observable<WishlistWithPropertiesDTO> {
    return this.http
      .get<Result<WishlistWithPropertiesDTO>>(
        `${this.baseUrl}/${wishlistId}/properties`
      )
      .pipe(map((response) => response.data));
  }
}
