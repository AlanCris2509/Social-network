package com.example.social_network_backend.user.dto;

public record CreateUserRequest(String username, String password, String email, String role, Long departmentId) {}
