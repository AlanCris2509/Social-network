package com.example.social_network_backend.department;

import com.example.social_network_backend.department.dto.*;
import com.example.social_network_backend.shared.exception.AppException;
import com.example.social_network_backend.user.Role;
import com.example.social_network_backend.user.User;
import com.example.social_network_backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAllWithHead().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest req) {
        if (departmentRepository.existsByName(req.name())) {
            throw new AppException("Department name already exists", HttpStatus.CONFLICT);
        }
        User head = resolveHead(req.headOfDepartmentId());
        Department dept = new Department();
        dept.setName(req.name());
        dept.setLocation(req.location());
        dept.setHeadOfDepartment(head);
        return toDto(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, CreateDepartmentRequest req) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Department not found", HttpStatus.NOT_FOUND));
        if (departmentRepository.existsByNameAndIdNot(req.name(), id)) {
            throw new AppException("Department name already exists", HttpStatus.CONFLICT);
        }
        User head = resolveHead(req.headOfDepartmentId());
        dept.setName(req.name());
        dept.setLocation(req.location());
        dept.setHeadOfDepartment(head);
        return toDto(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Department not found", HttpStatus.NOT_FOUND));
        userRepository.clearDepartment(dept);
        departmentRepository.delete(dept);
    }

    private User resolveHead(Long headId) {
        if (headId == null) {
            throw new AppException("Head of department is required", HttpStatus.BAD_REQUEST);
        }
        User head = userRepository.findById(headId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        if (head.getRole() == Role.ADMIN) {
            throw new AppException("Admin users cannot be head of a department", HttpStatus.BAD_REQUEST);
        }
        return head;
    }

    private DepartmentDto toDto(Department dept) {
        User head = dept.getHeadOfDepartment();
        return new DepartmentDto(
                dept.getId(), dept.getName(), dept.getLocation(),
                head != null ? head.getId() : null,
                head != null ? head.getUsername() : null,
                dept.getCreatedAt() != null ? dept.getCreatedAt().toString() : null
        );
    }
}
