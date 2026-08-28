package com.sprout.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SproutBackendApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring context (security, JPA, JWT beans) wires up cleanly.
    }
}
