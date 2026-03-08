package com.example.social_network_backend.user;

import com.example.social_network_backend.department.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    /** Simple role filter — used for admins who have no department association. */
    List<User> findAllByRole(Role role);

    /** Eager-fetches department in a single query — avoids N+1 when mapping USER rows to DTO. */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.role = :role")
    List<User> findAllByRoleWithDepartment(@Param("role") Role role);

    @Modifying
    @Query("UPDATE User u SET u.department = null, u.joinedDepartmentAt = null WHERE u.department = :department")
    void clearDepartment(@Param("department") Department department);
}
