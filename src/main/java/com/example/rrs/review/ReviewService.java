package com.example.rrs.review;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rrs.review.dto.ReviewDtos;

@Service
public class ReviewService {

	private final ReviewRepository reviewRepository;

	public ReviewService(ReviewRepository reviewRepository) {
		this.reviewRepository = reviewRepository;
	}

	@Transactional
	public ReviewDtos.Response create(ReviewDtos.CreateRequest request) {
		Review review = new Review();
		review.setRouteId(request.routeId);
		review.setCommuterId(request.commuterId);
		review.setRating(request.rating);
		review.setTitle(request.title);
		review.setComment(request.comment);
		review = reviewRepository.save(review);
		return toResponse(review);
	}

	@Transactional(readOnly = true)
	public ReviewDtos.Response getById(Long id) {
		Review review = reviewRepository.findById(id)
				.orElseThrow(() -> new NoSuchElementException("Review not found"));
		return toResponse(review);
	}

	@Transactional
	public ReviewDtos.Response update(Long id, Long commuterId, ReviewDtos.UpdateRequest request) {
		Review review = reviewRepository.findByIdAndCommuterId(id, commuterId)
				.orElseThrow(() -> new NoSuchElementException("Review not found for commuter"));
		if (request.rating != null) review.setRating(request.rating);
		if (request.title != null) review.setTitle(request.title);
		if (request.comment != null) review.setComment(request.comment);
		review = reviewRepository.save(review);
		return toResponse(review);
	}

	@Transactional
	public void delete(Long id, Long commuterId) {
		Review review = reviewRepository.findByIdAndCommuterId(id, commuterId)
				.orElseThrow(() -> new NoSuchElementException("Review not found for commuter"));
		reviewRepository.delete(review);
	}

	@Transactional(readOnly = true)
	public List<ReviewDtos.Response> listByRoute(Long routeId) {
		return reviewRepository.findByRouteIdOrderByCreatedAtDesc(routeId)
				.stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public ReviewDtos.RatingSummaryResponse getRatingSummary(Long routeId) {
		Double avg = reviewRepository.findAverageRatingByRouteId(routeId);
		Long count = reviewRepository.countByRouteId(routeId);
		ReviewDtos.RatingSummaryResponse res = new ReviewDtos.RatingSummaryResponse();
		res.routeId = routeId;
		res.averageRating = avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;
		res.totalReviews = count == null ? 0L : count;
		return res;
	}

	private ReviewDtos.Response toResponse(Review review) {
		ReviewDtos.Response r = new ReviewDtos.Response();
		r.id = review.getId();
		r.routeId = review.getRouteId();
		r.commuterId = review.getCommuterId();
		r.rating = review.getRating();
		r.title = review.getTitle();
		r.comment = review.getComment();
		r.createdAt = review.getCreatedAt();
		r.updatedAt = review.getUpdatedAt();
		return r;
	}
}


