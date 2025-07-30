import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class HandleImgService {
  constructor(private http: HttpClient) {}

  handleImage(img: string): string {
    return `${environment.base}${img}`;
  }
}
