import {
  Component,
  AfterViewInit,
  HostListener,
  OnDestroy,
  inject,
  ElementRef,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { FormsModule } from '@angular/forms';
import { LangService } from '../../core/services/lang.service';
import { ThemeService } from '../../core/services/theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { TopNavComponent } from '../top-nav/top-nav';
import { SearchFilterGroupComponent } from '../search-filter-group/search-filter-group';
import { DialogService } from '../../core/services/dialog.service';
import { HandleImgService } from '../../core/services/handleImg.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/User/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxDaterangepickerMd,
    FormsModule,
    TranslateModule,
    TopNavComponent,
    SearchFilterGroupComponent,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  isDarkMode = false;
  isSearchBarSticky = false;
  wasFilterClicked = false;
  dialogService = inject(DialogService);
  authService = inject(AuthService);
  isMessagesRoute = false;

  constructor(
    public lang: LangService,
    public theme: ThemeService,
    private elementRef: ElementRef,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  userId: any = (() => {
    const userId = this.authService.userId;
    return userId;
  })();
  handleImgService = inject(HandleImgService);
  @Input() user: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser
      ? JSON.parse(storedUser)?.firstName ?? JSON.parse(storedUser)?.userName
      : '';
  })();

  ifImg: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.profilePictureURL ?? '' : '';
  })();

  @Input() img: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return this.handleImgService.handleImage(
      storedUser ? JSON.parse(storedUser)?.profilePictureURL ?? '' : ''
    );
  })();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.dropdownOpen) {
      this.closeDropdown();
    }

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
  ngOnDestroy(): void {}

  navItems = [
    {
      label: 'HEADER.HOMES',
      route: '/',
      active: true,
      imgSrc:
        'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/4aae4ed7-5939-4e76-b100-e69440ebeae4.png?im_w=240',
      videoSources: [
        {
          src: 'https://a0.muscache.com/videos/search-bar-icons/hevc/house-twirl-selected.mov',
          type: 'video/mp4; codecs="hvc1"',
        },
        {
          src: 'https://a0.muscache.com/videos/search-bar-icons/webm/house-twirl-selected.webm',
          type: 'video/webm',
        },
      ],
      poster:
        'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/4aae4ed7-5939-4e76-b100-e69440ebeae4.png?im_w=240',
      isNew: false,
    },
    {
      label: 'HEADER.EXPERIENCES',
      route: '/experiences',
      active: false,
      imgSrc:
        'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/e47ab655-027b-4679-b2e6-df1c99a5c33d.png?im_w=240',
      videoSources: [
        {
          src: 'https://a0.muscache.com/videos/search-bar-icons/hevc/balloon-twirl.mov',
          type: 'video/mp4; codecs="hvc1"',
        },
        {
          src: 'https://a0.muscache.com/videos/search-bar-icons/webm/balloon-twirl.webm',
          type: 'video/webm',
        },
      ],
      poster:
        'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/e47ab655-027b-4679-b2e6-df1c99a5c33d.png?im_w=240',
      isNew: true,
    },
    {
      label: 'HEADER.SERVICES',
      route: '/services',
      active: false,
      imgSrc:
        'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/3d67e9a9-520a-49ee-b439-7b3a75ea814d.png?im_w=240',
      videoSources: [
        {
          src: 'https://a0.muscache.com/videos/search-bar-icons/hevc/consierge-twirl.mov',
          type: 'video/mp4; codecs="hvc1"',
        },
        {
          src: 'https://a0.muscache.com/videos/search-bar-icons/webm/consierge-twirl.webm',
          type: 'video/webm',
        },
      ],
      poster:
        'https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-search-bar-icons/original/3d67e9a9-520a-49ee-b439-7b3a75ea814d.png?im_w=240',
      isNew: true,
    },
  ];
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

  isLoggedIn = false;

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark');
    this.checkIfMessagesRoute();
    this.isLoggedIn =
      this.userId === null || this.userId === undefined ? false : true;
  }

  checkIfMessagesRoute() {
    this.isMessagesRoute =
      this.router.url.startsWith('/Messages') ||
      this.router.url.startsWith('/WishLists') ||
      this.router.url.startsWith('/wishlist') ||
      this.router.url.startsWith('/profile') ||
      this.router.url.startsWith('/update-profile') ||
      this.router.url.startsWith('/your-reviews');
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe(() => {
      this.checkIfMessagesRoute();
    });
    this.isLoggedIn =
      this.userId === null || this.userId === undefined ? false : true;
    (window as any).Logging = () => {
      this.isLoggedIn =
        this.userId === null || this.userId === undefined ? false : true;
    };
  }

  changeLanguage(lang: string) {
    this.lang.switchLang(lang);
    if (lang == 'ar') {
      document.body.classList.contains('dRTL');
      console.log(true);
    } else {
      document.body.classList.contains('dLTR');
    }
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
    this.authService.clear();
    this.userService.Logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
