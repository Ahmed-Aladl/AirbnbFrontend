import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { 
    PropertyDisplayDTO, 
    PropertyFilterDto, 
    PaginatedResult, 
    PropertyImagesCreateContainerDTO,
    IpLocation 
} from '../models/property.model';
import { HttpClientModule } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {
    static readonly imports = [HttpClientModule];
    private baseUrl = `${environment.baseUrl}/properties`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<PropertyDisplayDTO[]> {
        return this.http.get<PropertyDisplayDTO[]>(this.baseUrl);
    }

    getPage(page: number = 1, pageSize: number = 7): Observable<PaginatedResult<PropertyDisplayDTO>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<PaginatedResult<PropertyDisplayDTO>>(`${this.baseUrl}/page`, { params });
    }

    getNearestPage(ipLocation: IpLocation, page: number = 1, pageSize: number = 7, maxDistanceKm: number = 10): Observable<PaginatedResult<PropertyDisplayDTO>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString())
            .set('maxDistanceKm', maxDistanceKm.toString())
            .set('latitude', ipLocation.latitude.toString())
            .set('longitude', ipLocation.longitude.toString());
        return this.http.get<PaginatedResult<PropertyDisplayDTO>>(`${this.baseUrl}/nearest`, { params });
    }

    getFilteredPage(filterDto: PropertyFilterDto): Observable<PaginatedResult<PropertyDisplayDTO>> {
        return this.http.post<PaginatedResult<PropertyDisplayDTO>>(`${this.baseUrl}/filter`, filterDto);
    }

    getById(id: number): Observable<PropertyDisplayDTO> {
        return this.http.get<PropertyDisplayDTO>(`${this.baseUrl}/${id}`);
    }

    updateProperty(id: number, updateData: Partial<PropertyDisplayDTO>): Observable<PropertyDisplayDTO> {
        return this.http.put<PropertyDisplayDTO>(`${this.baseUrl}/${id}`, updateData);
    }

    getByIdWithCover(id: number): Observable<PropertyDisplayDTO> {
        return this.http.get<PropertyDisplayDTO>(`${this.baseUrl}/${id}/cover`);
    }

    getByHostId(hostId: string): Observable<PropertyDisplayDTO[]> {
        return this.http.get<PropertyDisplayDTO[]>(`${this.baseUrl}/host/${hostId}`);
    }

    getByHostIdWithCover(hostId: string): Observable<PropertyDisplayDTO[]> {
        return this.http.get<PropertyDisplayDTO[]>(`${this.baseUrl}/host/${hostId}/cover`);
    }

    add(property: PropertyDisplayDTO): Observable<PropertyDisplayDTO> {
        return this.http.post<PropertyDisplayDTO>(this.baseUrl, property);
    }

    update(property: PropertyDisplayDTO): Observable<PropertyDisplayDTO> {
        return this.http.put<PropertyDisplayDTO>(`${this.baseUrl}/${property.id}`, property);
    }

    delete(id: number): Observable<PropertyDisplayDTO> {
        return this.http.delete<PropertyDisplayDTO>(`${this.baseUrl}/${id}`);
    }

    addImages(imagesContainer: PropertyImagesCreateContainerDTO): Observable<any> {
        return this.http.post(`${this.baseUrl}/images`, imagesContainer);
    }

    deleteImages(imgIds: number[], propertyId: number, userId: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}/${propertyId}/images`, {
            body: {
                imgIds,
                userId
            }
        });
    }
}
