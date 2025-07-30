import { Property } from './../../../core/models/Property';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import dayjs, { Dayjs } from 'dayjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HostProfile, HostprofileService } from '../../../core/services/hostProfile/hostprofile-service';

@Component({
  selector: 'app-contact-host',
  imports:[FormsModule,CommonModule],
  templateUrl: './contact-host.component.html',
   styleUrls: ['./contact-host.component.css']
})

export class ContactHostComponent implements OnInit {


  hostId!: string;
  checkIn!: string;
  checkOut!: string;
  guests!: number;
  adults!: number;
  children!: number;
  infants!: number;
 showReservationBox: boolean = true;
  propertyid!:any;
  hostProfile!: HostProfile;

  constructor(  private route: ActivatedRoute,
      private hostProfileService: HostprofileService) {}

 ngOnInit(): void {
   this.route.paramMap.subscribe(params => {
    this.propertyid = params.get('propertyId')!;
    this.hostId = params.get('hostId')!;
  });

  this.route.queryParamMap.subscribe(query => {
    // this.checkIn = query.get('check_in');
    // this.checkOut = query.get('check_out');
    // this.guests = query.get('guests');
    // this.totalPrice = query.get('total_price');
    // others like adults, children, infants if needed
  });

  // Get host info (name, image)
  this.hostProfileService.getHostProfile(this.hostId).subscribe(host => {
    this.hostProfile.firstName = this.getHostProfile.name;
    // this.hostProfile.lastName=
  });
  }

getHostProfile(hostId: string) {
  this.hostProfileService.getHostProfile(hostId).subscribe({
    next: (profile) => {
      this.hostProfile = profile;
      console.log('Host profile loaded:', profile);
    },
    error: (err) => {
      console.error('Error fetching host profile:', err);
    }
  });
}


}
