package com.sprout.backend.repository;

import com.sprout.backend.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

    List<Quote> findAllByOrderByIdAsc();
}
