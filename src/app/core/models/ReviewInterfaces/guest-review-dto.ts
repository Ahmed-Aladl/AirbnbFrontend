export interface EditReviewByGuestDTO {
  Id: number;
  PropertyId: number;
  BookingId: number;
  Comment: string;
  PrivateComment?: string;
  Rating: number;
  Cleanliness: number;
  Accuracy: number;
  Communication: number;
  CheckIn: number;
  Location: number;
  Value: number;
}

export interface UserProfileDto {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  birthDate?: string;
  country?: string;
}

export interface IGuestReviewDto {
  id: number;
  propertyId: number;
  // bookingId: number;
  userId: string;
  comment: string;
  privateComment?: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  checkIn: number;
  location: number;
  value: number;
  user: UserProfileDto;
  createdAt: string;
  // updatedAt?: string;
  // user?: {
  //   id: string;
  //   firstName: string;
  //   lastName: string;
  //   profilePicture?: string;
  // };
}
