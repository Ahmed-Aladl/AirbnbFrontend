import { Component, inject } from '@angular/core';
import { ReviewService } from '../../core/services/Review/review.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-your-reviews',
  imports: [CommonModule],
  templateUrl: './your-reviews.html',
  styleUrl: './your-reviews.css',
})
export class YourReviews {
  authService = inject(AuthService);
  constructor(private reviewService: ReviewService) {}
  userId = this.authService.userId || '';

  reviews: any[] = [];
  getReviews() {
    this.reviewService.getReviewsByUserId(this.userId).subscribe({
      next: (res) => {
        this.reviews = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
