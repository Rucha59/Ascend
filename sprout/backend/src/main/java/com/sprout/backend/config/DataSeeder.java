package com.sprout.backend.config;

import com.sprout.backend.entity.Quote;
import com.sprout.backend.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds the quote rotation once, on an empty table — same lines as the Sprout dashboard prototype. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final QuoteRepository quoteRepository;

    private static final List<String> DEFAULT_QUOTES = List.of(
            "Tiny steps still count. Look how much you've grown. 🌱",
            "You watered today. That's enough. That's everything.",
            "Be proud of the version of you who showed up today.",
            "Progress is a garden, not a sprint — keep tending it.",
            "Every little check mark is a seed. Plant it and go easy on yourself.",
            "You don't have to feel ready. You just have to show up softly.",
            "Small, kind, repeated things — that's the whole secret.",
            "Today counts too, even the quiet, ordinary version of it."
    );

    @Override
    public void run(String... args) {
        if (quoteRepository.count() == 0) {
            DEFAULT_QUOTES.forEach(text -> quoteRepository.save(Quote.builder().text(text).build()));
        }
    }
}
