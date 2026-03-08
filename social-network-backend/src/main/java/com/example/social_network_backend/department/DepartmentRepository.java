package com.example.social_network_backend.department;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    /** Eager-fetches headOfDepartment in a single query — avoids N+1 when mapping to DTO. */
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.headOfDepartment")
    List<Department> findAllWithHead();

    @Modifying
    @Query("UPDATE Department d SET d.headOfDepartment = null WHERE d.headOfDepartment.id = :userId")
    void clearHeadByUserId(@Param("userId") Long userId);
}
