package com.example.rrs.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.rrs.review.dto.ReviewDtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api")
@Validated
public class ReviewController {

	private final ReviewService reviewService;

	public ReviewController(ReviewService reviewService) {
		this.reviewService = reviewService;
	}

	@PostMapping("/reviews")
	public ResponseEntity<ReviewDtos.Response> create(@Valid @RequestBody ReviewDtos.CreateRequest request) {
		return new ResponseEntity<>(reviewService.create(request), HttpStatus.CREATED);
	}

	@GetMapping("/reviews/{id}")
	public ReviewDtos.Response getById(@PathVariable("id") Long id) {
		return reviewService.getById(id);
	}

	@PutMapping("/reviews/{id}")
	public ReviewDtos.Response update(
			@PathVariable("id") Long id,
			@RequestParam("commuterId") @NotNull Long commuterId,
			@Valid @RequestBody ReviewDtos.UpdateRequest request) {
		return reviewService.update(id, commuterId, request);
	}

	@DeleteMapping("/reviews/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable("id") Long id,
			@RequestParam("commuterId") @NotNull Long commuterId) {
		reviewService.delete(id, commuterId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/routes/{routeId}/reviews")
	public List<ReviewDtos.Response> listByRoute(@PathVariable("routeId") Long routeId) {
		return reviewService.listByRoute(routeId);
	}

	@GetMapping("/routes/{routeId}/rating")
	public ReviewDtos.RatingSummaryResponse ratingSummary(@PathVariable("routeId") Long routeId) {
		return reviewService.getRatingSummary(routeId);
	}
}


