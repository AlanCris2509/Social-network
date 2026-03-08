package com.example.social_network_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Drops tables that no longer have a corresponding JPA entity.
 * Needed because ddl-auto=update never removes obsolete tables.
 * Uses IF EXISTS so subsequent startups are no-ops.
 */
@Component
@Order(1)
public class LegacySchemaCleaner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public LegacySchemaCleaner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("DROP TABLE IF EXISTS refresh_tokens CASCADE");
    }
}
