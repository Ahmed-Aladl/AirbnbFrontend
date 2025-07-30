import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PropertyDisplayDTO, PropertyService } from '../../../core/services/Property/property.service';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { Property } from '../../../core/models/Property';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
// import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { FormsModule } from '@angular/forms';
import moment from 'moment';

// npm install angular-calendar date-fns
//npm install ng2-date-picker --legacy-peer-deps
@Component({
  selector: 'app-mapLocation',
    standalone: true,
  imports: [CommonModule,LeafletModule,NgxDaterangepickerMd,FormsModule],
  templateUrl: './mapLocation.component.html',
  styleUrls: ['./mapLocation.component.css']
})
export class MapLocationComponent implements OnInit {
 @Input() propertyId!: number;
 


  options!: L.MapOptions;
  layers: L.Layer[] = [];
  // center!: L.LatLngExpression;
  zoom: number = 13;
  center!: L.LatLng; 

  title = '';
  city = '';
  country = '';


  constructor(private propertyService: PropertyService) {}

  loading = true;
  ngOnInit(): void {
    this.propertyService.getPropertyById(this.propertyId).subscribe((property: Property) => {
      this.center = L.latLng(property.latitude, property.longitude);

       this.title = property.title;
      this.city = property.city;
      this.country = property.country;

      this.options = {
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          })
        ],
        zoom: this.zoom,
        center: this.center
      };

      this.layers = [
        L.marker(this.center, {
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
          })
        }).bindPopup(`<b>${property.title}</b><br>${property.city}, ${property.country}`)
      ];
      this.loading = false;
    });
  }


} //end class
