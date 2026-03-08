package com.example.social_network_backend.user;

import com.example.social_network_backend.department.Department;
import com.example.social_network_backend.department.DepartmentRepository;
import com.example.social_network_backend.shared.exception.AppException;
import com.example.social_network_backend.user.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserManagementService(UserRepository userRepository,
                                 DepartmentRepository departmentRepository,
                                 BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        List<Department> departments = departmentRepository.findAllWithHead();

        Map<Long, String> deptHeadMap = departments.stream()
                .filter(d -> d.getHeadOfDepartment() != null)
                .collect(Collectors.toMap(
                        Department::getId,
                        d -> d.getHeadOfDepartment().getUsername()
                ));

        return userRepository.findAllByRoleWithDepartment(Role.USER).stream()
                .map(u -> toUserDto(u, deptHeadMap))
                .toList();
    }

    @Transactional
    public void deleteUser(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw new AppException("Cannot delete your own account", HttpStatus.BAD_REQUEST);
        }
        userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        departmentRepository.clearHeadByUserId(id);
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllAdmins() {
        return userRepository.findAllByRole(Role.ADMIN).stream()
                .map(u -> new AdminUserDto(u.getId(), u.getUsername(), u.getEmail()))
                .toList();
    }

    @Transactional
    public UserDto createUser(CreateUserRequest req) {
        if (userRepository.findByUsername(req.username()).isPresent()) {
            throw new AppException("Username already taken", HttpStatus.CONFLICT);
        }
        Role role;
        try {
            role = Role.valueOf(req.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid role: " + req.role(), HttpStatus.BAD_REQUEST);
        }

        User user = new User(req.username(), passwordEncoder.encode(req.password()), req.email(), role);

        if (req.departmentId() != null && role == Role.USER) {
            Department dept = departmentRepository.findById(req.departmentId())
                    .orElseThrow(() -> new AppException("Department not found", HttpStatus.NOT_FOUND));
            user.setDepartment(dept);
            user.setJoinedDepartmentAt(Instant.now());
        }

        User saved = userRepository.save(user);
        return buildUserDtoById(saved.getId());
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (!user.getUsername().equals(req.username()) &&
                userRepository.findByUsername(req.username()).isPresent()) {
            throw new AppException("Username already taken", HttpStatus.CONFLICT);
        }

        user.setUsername(req.username());
        user.setEmail(req.email());

        if (req.password() != null && !req.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.password()));
        }

        if (req.departmentId() != null) {
            Department dept = departmentRepository.findById(req.departmentId())
                    .orElseThrow(() -> new AppException("Department not found", HttpStatus.NOT_FOUND));
            if (user.getDepartment() == null || !user.getDepartment().getId().equals(req.departmentId())) {
                user.setJoinedDepartmentAt(Instant.now());
            }
            user.setDepartment(dept);
        } else {
            user.setDepartment(null);
            user.setJoinedDepartmentAt(null);
        }

        userRepository.save(user);
        return buildUserDtoById(id);
    }

    private UserDto buildUserDtoById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Map<Long, String> deptHeadMap = departmentRepository.findAllWithHead().stream()
                .filter(d -> d.getHeadOfDepartment() != null)
                .collect(Collectors.toMap(Department::getId, d -> d.getHeadOfDepartment().getUsername()));

        return toUserDto(user, deptHeadMap);
    }

    private UserDto toUserDto(User u, Map<Long, String> deptHeadMap) {
        Department dept = u.getDepartment();
        return new UserDto(
                u.getId(), u.getUsername(), u.getEmail(),
                dept != null ? dept.getId() : null,
                dept != null ? dept.getName() : null,
                dept != null ? deptHeadMap.get(dept.getId()) : null,
                u.getJoinedDepartmentAt() != null ? u.getJoinedDepartmentAt().toString() : null
        );
    }
}
