package com.example.social_network_backend.department.dto;

public record DepartmentDto(
        Long id,
        String name,
        String location,
        Long headId,
        String headUsername,
        String createdAt
) {}
