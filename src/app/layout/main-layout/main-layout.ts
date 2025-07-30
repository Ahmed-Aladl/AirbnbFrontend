import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header";
import { Footer } from '../../components/footer/footer';
import { HostProperties } from "../../components/host-properties/host-properties";
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [HeaderComponent, Footer, RouterOutlet, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  isMessagesRoute = false;
  isSecondRoute = false;

  constructor(private router: Router) { }
  ngOnInit(): void {
    this.checkIfMessagesRoute();
    this.checkIfSecondRoute();
  }
  checkIfMessagesRoute() {
    this.isMessagesRoute =
      this.router.url.startsWith('/Messages');
  }
  checkIfSecondRoute() {
    this.isSecondRoute =
      this.router.url.startsWith('/WishLists') ||
      this.router.url.startsWith('/wishlist')||
      this.router.url.startsWith('/profile') ||
      this.router.url.startsWith('/update-profile')
      || this.router.url.startsWith('/your-reviews');
  }
  ngAfterViewInit(): void {
    this.router.events.subscribe(() => {
      this.checkIfMessagesRoute();
      this.checkIfSecondRoute();
    });
  }

}
