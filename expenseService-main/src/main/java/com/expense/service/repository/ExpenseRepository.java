package com.expense.service.repository;

import com.expense.service.entities.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(String userId);

    List<Expense> findByUserIdAndDeletedFalse(String userId);

    Page<Expense> findByUserIdAndDeletedFalse(String userId, Pageable pageable);

    List<Expense> findByUserIdAndCreatedAtBetween(String userId, Timestamp startTime, Timestamp endTime);

    List<Expense> findByUserIdAndDeletedFalseAndCreatedAtBetween(String userId, Timestamp startTime, Timestamp endTime);

    Optional<Expense> findByUserIdAndExternalId(String userId, String externalId);

    Optional<Expense> findByUserIdAndExternalIdAndDeletedFalse(String userId, String externalId);
}
