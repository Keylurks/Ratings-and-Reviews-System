package com.example.rrs.review.dto;

import java.time.Instant;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReviewDtos {

	public static class CreateRequest {
		@NotNull
		public Long routeId;

		@NotNull
		public Long commuterId;

		@NotNull
		@Min(1)
		@Max(5)
		public Integer rating;

		@NotBlank
		@Size(max = 120)
		public String title;

		@Size(max = 2000)
		public String comment;
	}

	public static class UpdateRequest {
		@Min(1)
		@Max(5)
		public Integer rating;

		@Size(max = 120)
		public String title;

		@Size(max = 2000)
		public String comment;
	}

	public static class Response {
		public Long id;
		public Long routeId;
		public Long commuterId;
		public Integer rating;
		public String title;
		public String comment;
		public Instant createdAt;
		public Instant updatedAt;
	}

	public static class RatingSummaryResponse {
		public Long routeId;
		public Double averageRating;
		public Long totalReviews;
	}
}


