# 🏠 Airbnb Frontend

A modern, responsive Airbnb clone built with Angular 20, featuring a comprehensive property rental platform with advanced search capabilities, real-time messaging, and seamless user experience.

![Angular](https://img.shields.io/badge/Angular-20.1.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.7-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

## 🌟 Features

### 🔍 **Advanced Search & Filtering**
- Location-based property search with interactive maps
- Date range picker for availability checking
- Advanced filters (price, amenities, property type)
- Real-time search results

### 🏡 **Property Management**
- **Host Dashboard**: Complete property management system
- **Property Listings**: Detailed property information with image galleries
- **Availability Calendar**: Dynamic booking calendar
- **Pricing Management**: Flexible pricing strategies

### 👤 **User Experience**
- **User Profiles**: Comprehensive user management
- **Wishlist**: Save and organize favorite properties
- **Reviews System**: Rate and review properties and hosts
- **Booking History**: Track all reservations

### 💬 **Communication**
- **Real-time Messaging**: SignalR-powered chat system
- **AI Chatbot**: Intelligent customer support
- **Notifications**: Real-time updates and alerts

### 🌍 **Localization & Accessibility**
- Multi-language support (English, Arabic)
- Responsive design for all devices
- Interactive maps with Leaflet integration
- Modern UI with Angular Material and Tailwind CSS

## 🛠️ Tech Stack

### **Frontend Framework**
- **Angular 20.1.2** - Modern web application framework
- **TypeScript 5.8.2** - Type-safe JavaScript

### **UI & Styling**
- **Angular Material 20.1.3** - Material Design components
- **Tailwind CSS 2.2.19** - Utility-first CSS framework
- **Bootstrap 5.3.7** - Responsive design system
- **Animate.css** - CSS animations
- **FontAwesome** - Icon library

### **Maps & Visualization**
- **Leaflet** - Interactive maps
- **Google Maps API** - Location services
- **Swiper** - Touch slider components

### **Real-time Communication**
- **SignalR** - Real-time web functionality
- **RxJS** - Reactive programming

### **Internationalization**
- **Angular i18n** - Multi-language support
- **ngx-translate** - Translation management

### **Development Tools**
- **Angular CLI 20.1.1** - Development tooling
- **Prettier** - Code formatting
- **Karma & Jasmine** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahmed-Aladl/AirbnbFrontend.git
   cd AirbnbFrontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   ng serve -o
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

## 📱 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with auto-open browser |
| `npm run build` | Build the project for production |
| `npm run watch` | Build in watch mode for development |
| `npm test` | Run unit tests with Karma |
| `npm run serve:ssr` | Serve the SSR version |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── calendar/        # Date picker and calendar
│   │   ├── chat-bot/        # AI chatbot component
│   │   ├── search-filter/   # Advanced search filters
│   │   └── ...
│   ├── core/                # Core services and models
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # Business logic services
│   ├── layout/              # Application layouts
│   │   ├── main-layout/     # Default user layout
│   │   ├── host-layout/     # Host dashboard layout
│   │   └── dashboard/       # Admin dashboard layout
│   ├── pages/               # Feature pages
│   │   ├── home/            # Landing page
│   │   ├── property-info/   # Property details
│   │   ├── booking/         # Reservation system
│   │   ├── profile/         # User profiles
│   │   └── ...
│   └── shared/              # Shared utilities
│       ├── components/      # Shared components
│       ├── directives/      # Custom directives
│       └── pipes/           # Custom pipes
├── assets/                  # Static assets
│   ├── i18n/               # Translation files
│   └── images/             # Image resources
└── environments/           # Environment configurations
```

## 🌐 Key Features Deep Dive

### **Search & Discovery**
- **Smart Filters**: Filter by location, dates, guests, and amenities
- **Map Integration**: Interactive property locations
- **Instant Results**: Real-time search as you type

### **Property Management**
- **Multi-step Listing**: Guided property creation wizard
- **Calendar Management**: Availability and pricing calendar
- **Photo Gallery**: Drag-and-drop image management

### **Booking System**
- **Instant Booking**: Seamless reservation process
- **Payment Integration**: Secure payment processing
- **Booking Management**: Comprehensive booking dashboard

### **Communication Hub**
- **Host-Guest Messaging**: Direct communication channel
- **Automated Notifications**: Booking confirmations and reminders
- **Support Chat**: AI-powered customer support

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
ng test --watch

# Generate coverage report
ng test --code-coverage
```

## 🏗️ Building for Production

```bash
# Build for production
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## 🌍 Internationalization

The application supports multiple languages:
- English (default)
- Arabic (RTL support)

Translation files are located in `src/assets/i18n/`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

This project uses Prettier for code formatting. The configuration is defined in `package.json`:

```json
{
  "prettier": {
    "overrides": [
      {
        "files": "*.html",
        "options": {
          "parser": "angular"
        }
      }
    ]
  }
}
```

## 🐛 Known Issues

- Peer dependency conflicts with some packages (use `--legacy-peer-deps` flag)
- Some Angular Material components may require version alignment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ahmed Essam** - [GitHub Profile](https://github.com/Ahmed-Aladl)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Material Design for the UI components
- Leaflet for mapping capabilities
- All contributors and the open-source community

---

⭐ **Star this repository if you found it helpful!**
