import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LangService } from '../../core/services/lang.service';
import { DialogService } from '../../core/services/dialog.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hostheader',
  standalone: true,
  imports: [CommonModule, RouterModule,TranslateModule],
  templateUrl: './host-header.html',
  styleUrls: ['./host-header.css'],
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  dialogService = inject(DialogService);

  ngOnInit(): void { }


  constructor(
    public lang: LangService,
    public theme: ThemeService,
    private elementRef: ElementRef,
    private router: Router

  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.dropdownOpen) {
      this.closeDropdown();
    }
  }

  dropdownOpen = false;
  dropdownClosing = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.dropdownClosing = !this.dropdownOpen;
  }

  openDropdown() {
    this.dropdownOpen = true;
    this.dropdownClosing = false;
  }

  closeDropdown() {
    this.dropdownClosing = true;
    this.dropdownOpen = false;
  }

  onAnimationEnd() {
    if (this.dropdownClosing) {
      this.dropdownClosing = false;
    }
  }

  changeLanguage(lang: string) {
    this.lang.switchLang(lang);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.theme.toggleTheme();
  }

  openLoginDialog() {
    this.dialogService.openDialog('login');
  }

  openRegisterDialog() {
    this.dialogService.openDialog('register');
  }
}
