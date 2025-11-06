package com.example.rrs.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

	List<Review> findByRouteIdOrderByCreatedAtDesc(Long routeId);

	List<Review> findByCommuterIdOrderByCreatedAtDesc(Long commuterId);

	Optional<Review> findByIdAndCommuterId(Long id, Long commuterId);

	@Query("SELECT AVG(r.rating) FROM Review r WHERE r.routeId = :routeId")
	Double findAverageRatingByRouteId(@Param("routeId") Long routeId);

	@Query("SELECT COUNT(r.id) FROM Review r WHERE r.routeId = :routeId")
	Long countByRouteId(@Param("routeId") Long routeId);
}


