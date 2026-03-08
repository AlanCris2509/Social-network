package com.example.social_network_backend.auth.dto;

public record RefreshResponse(String accessToken, String refreshToken, long expiresIn) {}
