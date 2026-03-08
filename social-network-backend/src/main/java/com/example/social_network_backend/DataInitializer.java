package com.example.social_network_backend;

import com.example.social_network_backend.department.Department;
import com.example.social_network_backend.department.DepartmentRepository;
import com.example.social_network_backend.user.Role;
import com.example.social_network_backend.user.User;
import com.example.social_network_backend.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@Order(2)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Step 1: save users without department
        User admin = userRepository.save(new User("admin", passwordEncoder.encode("admin123"), "admin@example.com", Role.ADMIN));
        User user1 = userRepository.save(new User("user1", passwordEncoder.encode("user123"), "user1@example.com", Role.USER));
        User user2 = userRepository.save(new User("user2", passwordEncoder.encode("user123"), "user2@example.com", Role.USER));
        User user3 = userRepository.save(new User("user3", passwordEncoder.encode("user123"), "user3@example.com", Role.USER));
        User user4 = userRepository.save(new User("user4", passwordEncoder.encode("user123"), "user4@example.com", Role.USER));

        // Step 2: create departments with heads
        Department engineering = new Department();
        engineering.setName("Engineering");
        engineering.setLocation("New York");
        engineering.setHeadOfDepartment(user1);
        engineering = departmentRepository.save(engineering);

        Department marketing = new Department();
        marketing.setName("Marketing");
        marketing.setLocation("San Francisco");
        marketing.setHeadOfDepartment(user2);
        marketing = departmentRepository.save(marketing);

        // Step 3: assign departments to non-admin users
        Instant seedTime = Instant.now().minusSeconds(86400);
        user1.setDepartment(engineering);  user1.setJoinedDepartmentAt(seedTime.minusSeconds(7200));
        user2.setDepartment(marketing);    user2.setJoinedDepartmentAt(seedTime.minusSeconds(5400));
        user3.setDepartment(engineering);  user3.setJoinedDepartmentAt(seedTime.minusSeconds(3600));
        user4.setDepartment(marketing);    user4.setJoinedDepartmentAt(seedTime);
        userRepository.saveAll(List.of(user1, user2, user3, user4));
    }
}
