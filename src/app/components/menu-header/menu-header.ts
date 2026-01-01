import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LangService } from '../../core/services/lang.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/User/user.service';
import { DialogService } from '../../core/services/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { HandleImgService } from '../../core/services/handleImg.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subject, filter, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/Message/message.service';

@Component({
  selector: 'app-menu-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './menu-header.html',
  styleUrl: '../header/header.css',
})
export class MenuHeader implements AfterViewInit, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isDarkMode = false;
  isSearchBarSticky = false;
  wasFilterClicked = false;
  isMessagesRoute = false;
  currentRoute: string = '';
  unreadCount = 0;
  dropdownOpen = false;
  dropdownClosing = false;

  dialogService = inject(DialogService);
  authService = inject(AuthService);
  handleImgService = inject(HandleImgService);

  constructor(
    public lang: LangService,
    public theme: ThemeService,
    private elementRef: ElementRef,
    private router: Router,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.checkIfMessagesRoute();
      });

    this.chatService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count;
      });
  }

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark');
    this.checkIfMessagesRoute();
    this.isLoggedIn = !!this.userId;

    (window as any).Logging = () => {
      this.isLoggedIn = !!this.userId;
    };
  }

  ngAfterViewInit(): void {
    // Route change already handled in constructor
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get unreadCountNotifications(): number {
    return Number(localStorage.getItem('unReadCount')) || 0;
  }

  // Getters for user info
  get userId(): string | null {
    return this.authService.userId;
  }

  get user(): string {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return '';
    const user = JSON.parse(storedUser);
    return user?.firstName || user?.userName || '';
  }

  get ifImg(): string {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.profilePictureURL ?? '' : '';
  }

  get img(): string {
    return this.handleImgService.handleImage(this.ifImg);
  }

  isLoggedIn = false;

  switchMode() {
    this.router.navigate([this.currentRoute.includes('/host') ? '/' : '/host']);
  }

  checkIfMessagesRoute() {
    const url = this.router.url;
    this.isMessagesRoute = [
      '/Messages',
      '/WishLists',
      '/wishlist',
      '/profile',
      '/update-profile',
      '/your-reviews',
      '/notifications',
    ].some((route) => url.startsWith(route));
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

  logout() {
    // this.authService.clear();
    this.userService.Logout().subscribe({
      next: (res) => {
        this.authService.clear();
        this.isLoggedIn = false;
        localStorage.removeItem('unReadCount');
        this.router.navigate(['/']);
      },
      error: (err) => {},
    });
  }

  // Dropdown & UI Interaction
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.dropdownOpen) this.closeDropdown();
    if (!this.wasFilterClicked) {
      this.isSearchBarSticky = window.scrollY > 80;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = this.elementRef.nativeElement.querySelector('.dropdown');
    if (this.dropdownOpen && dropdown && !dropdown.contains(target)) {
      this.closeDropdown();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.closeDropdown();
  }

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
}
