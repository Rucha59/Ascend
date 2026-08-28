package com.sprout.backend.service;

import com.sprout.backend.entity.Quote;
import com.sprout.backend.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private static final String FALLBACK = "Show up today. That's the whole assignment.";

    private final QuoteRepository quoteRepository;

    /** Deterministic per day, so everyone on day N sees the same quote and it's stable on refresh. */
    public String getQuoteForDay(int dayNumber) {
        List<Quote> quotes = quoteRepository.findAllByOrderByIdAsc();
        if (quotes.isEmpty()) return FALLBACK;
        int index = Math.floorMod(dayNumber - 1, quotes.size());
        return quotes.get(index).getText();
    }
}
