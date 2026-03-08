package com.example.social_network_backend.auth.dto;

public record LoginResponse(String accessToken, String refreshToken, long expiresIn, UserInfo user) {}
