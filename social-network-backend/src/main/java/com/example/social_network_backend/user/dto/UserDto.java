package com.example.social_network_backend.user.dto;

public record UserDto(
        Long id,
        String username,
        String email,
        Long departmentId,
        String departmentName,
        String headUsername,
        String joinedDepartmentAt
) {}
