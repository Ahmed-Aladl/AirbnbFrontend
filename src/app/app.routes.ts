import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MainLayout } from './layout/main-layout/main-layout';
import { ListingWizardLayoutComponent } from './layout/listing-wizard-layout/listing-wizard-layout';
import { StepsPage } from './pages/add-property/steps-page/steps-page';
import { Step1TellUs } from './pages/add-property/step-1/step1-1-tell-us/step1-1-tell-us';
import { Step12WhichOf } from './pages/add-property/step-1/step1-2-which-of/step1-2-which-of';
import { Step13WhatType } from './pages/add-property/step-1/step1-3-what-type/step1-3-what-type';
import { Step14Where } from './pages/add-property/step-1/step1-4-1-where/step1-4-1-where';
import { Step142ConfirmAddress } from './pages/add-property/step-1/step1-4-2-confirm-address/step1-4-2-confirm-address';
import { Step15BasicAbout } from './pages/add-property/step-1/step1-5-basic-about/step1-5-basic-about';
import { Step21MakeYour } from './pages/add-property/step-2/step2-1-make-your/step2-1-make-your';
import { Step22TellGuests } from './pages/add-property/step-2/step2-2-tell-guests/step2-2-tell-guests';
import { Step23AddPhotos } from './pages/add-property/step-2/step2-3-1-add-photos/step2-3-1-add-photos';
import { Step232PhotosModal } from './pages/add-property/step-2/step2-3-2-photos-modal/step2-3-2-photos-modal';
import { Step233PhotosTaDa } from './pages/add-property/step-2/step2-3-3-photos-ta-da/step2-3-3-photos-ta-da';
import { Step24Title } from './pages/add-property/step-2/step2-4-title/step2-4-title';
import { Step25Describe } from './pages/add-property/step-2/step2-5-describe/step2-5-describe';
import { Step26Description } from './pages/add-property/step-2/step2-6-description/step2-6-description';
import { Step31Finish } from './pages/add-property/step-3/step3-1-finish/step3-1-finish';
import { Step32PickBooking } from './pages/add-property/step-3/step3-2-pick-booking/step3-2-pick-booking';
import { Step33ChooseWelcome } from './pages/add-property/step-3/step3-3-choose-welcome/step3-3-choose-welcome';
import { Step341Pricing } from './pages/add-property/step-3/step3-4-1-pricing/step3-4-1-pricing';
import { Step342PricingTax } from './pages/add-property/step-3/step3-4-2-pricing-tax/step3-4-2-pricing-tax';
import { Step35AddDiscount } from './pages/add-property/step-3/step3-5-add-discount/step3-5-add-discount';
import { Step36Safety } from './pages/add-property/step-3/step3-6-safety/step3-6-safety';
import { PropertyInfo } from './pages/property-info/property-info';
import { FilteredProperties } from './pages/filtered-properties/filtered-properties';
import { HostProperties } from './components/host-properties/host-properties';
import { Wishlists } from './pages/wishlist/wishlist';
import { WishListProperties } from './pages/wishlist-properties/wishlist-properties';
import { NotFound } from './components/not-found/not-found';
import { UserBookings } from './pages/booking/userbookings/userbookings';
import { UpdateList } from './pages/update-list/update-list';
import { Messages } from './pages/messages/messages';
import { PropertyBookings } from './pages/booking/property-bookings/property-bookings';
import { Availability } from './pages/availability-page/availability-page';
import { Host } from './layout/host/host';
import { Profile } from './pages/profile/profile';
import { UpdateProfile } from './pages/update-profile/update-profile';
import { YourReviews } from './pages/your-reviews/your-reviews';
import { Notifications } from './pages/notifications/notifications';
import { ReviewForm } from './components/review-form/review-form';
import { ContactHostComponent } from './pages/PropertyDetails/contact-host/contact-host.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'experiences', component: Home },
      { path: 'services', component: Home },
      { path: 'FilteredProperties', component: FilteredProperties },
      { path: 'property/:propertyId', component: PropertyInfo },

      { path: 'WishLists', component: Wishlists },
      {
        path: 'wishlist/:wishlistId/properties',
        component: WishListProperties,
      },
      { path: 'Messages', component: Messages },
      { path: 'profile/:id', component: Profile },
      { path: 'update-profile/:id', component: UpdateProfile },
      { path: 'your-reviews', component: YourReviews },
      { path: 'notifications', component: Notifications },
          {
          path: 'contact-host',
          component: ContactHostComponent
        }   
    ],
  },
  {
    path: 'listing-wizard',
    component: ListingWizardLayoutComponent,
    children: [
      { path: '', component: StepsPage },
      { path: 'step1-1-tell-us', component: Step1TellUs },
      { path: 'step1-2-which-of', component: Step12WhichOf },
      { path: 'step1-3-what-type', component: Step13WhatType },
      { path: 'step1-4-1-where', component: Step14Where },
      { path: 'step1-4-2-confirm-address', component: Step142ConfirmAddress },
      { path: 'step1-5-basic-about', component: Step15BasicAbout },
      { path: 'step2-1-make-your', component: Step21MakeYour },
      { path: 'step2-2-tell-guests', component: Step22TellGuests },
      { path: 'step2-3-1-add-photos', component: Step23AddPhotos },
      // { path: 'step2-3-2-photos-modal', component: Step232PhotosModal },
      { path: 'step2-3-3-photos-ta-da', component: Step233PhotosTaDa },
      { path: 'step2-4-title', component: Step24Title },
      { path: 'step2-5-describe', component: Step25Describe },
      { path: 'step2-6-description', component: Step26Description },
      { path: 'step3-1-finish', component: Step31Finish },
      { path: 'step3-2-pick-booking', component: Step32PickBooking },
      { path: 'step3-3-choose-welcome', component: Step33ChooseWelcome },
      { path: 'step3-4-1-pricing', component: Step341Pricing },
      { path: 'step3-4-2-pricing-tax', component: Step342PricingTax },
      { path: 'step3-5-add-discount', component: Step35AddDiscount },
      { path: 'step3-6-safety', component: Step36Safety },
    ],
  },
  { path: 'take-info/:id', component: UpdateProfile },
  { path: 'host', component: HostProperties },
  { path: 'guesttbookings', component: UserBookings },

  { path: 'propertybookings/:propertyId', component: PropertyBookings },
  { path: 'review/:id', component: ReviewForm },

  {
    path: 'hostsettings',
    component: Host,
    children: [
      { path: 'availability', component: Availability },
      { path: 'Messages', component: Messages },
    ],
  },

  { path: 'updatelist', component: UpdateList },

  { path: 'updatelist/:propertyId', component: UpdateList },

  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' },
];
