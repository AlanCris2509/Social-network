package com.example.social_network_backend.user.dto;

public record UpdateUserRequest(String username, String password, String email, Long departmentId) {}
