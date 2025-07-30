export interface PropertyImage {
    id?: number;
    groupName: string;
    propertyId: number;
    imageUrl: string;
    isCover: boolean;
    isDeleted?: boolean;
}

export interface IpLocation {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    state?: string;
}

export interface PropertyFilterDto {
    page?: number;
    pageSize?: number;
    minPrice?: number;
    maxPrice?: number;
    checkIn?: Date;
    checkOut?: Date;
    guests?: number;
    location?: IpLocation;
    maxDistanceKm?: number;
    propertyType?: string;
    amenities?: string[];
}

export interface PropertyDisplayDTO {
    id?: number;
    hostId: string;
    title: string;
    description: string;
    price: number;
    location: IpLocation;
    address: string;
    propertyType: string;
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    amenities: string[];
    images?: PropertyImage[];
    coverImage?: PropertyImage;
    isDeleted?: boolean;
    rating?: number;
    wishlistProperties?: any[]; // Can be typed more specifically if needed
}

export interface PropertyImagesCreateDTO {
    groupName: string;
    imageUrl: string;
    isCover: boolean;
}

export interface PropertyImagesCreateContainerDTO {
    propertyId: number;
    hostId: string;
    images: PropertyImagesCreateDTO[];
}

export interface PaginatedResult<T> {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}
