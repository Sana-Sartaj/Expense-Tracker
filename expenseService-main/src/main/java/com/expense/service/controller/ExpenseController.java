package com.expense.service.controller;

import com.expense.service.dto.ExpenseDto;
import com.expense.service.dto.PagedExpenseResponse;
import com.expense.service.exception.ResourceNotFoundException;
import com.expense.service.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expense/v1")
public class ExpenseController
{

    private final ExpenseService expenseService;

    @Autowired
    ExpenseController(ExpenseService expenseService){
        this.expenseService = expenseService;
    }

    @GetMapping(path = "/getExpense")
    public ResponseEntity<PagedExpenseResponse> getExpense(
            @RequestHeader(value = "X-User-Id") @NonNull String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size){
        PagedExpenseResponse response = expenseService.getExpenses(userId, page, size);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping(path = "/getExpenseByDateRange")
    public ResponseEntity<List<ExpenseDto>> getExpenseByDateRange(
            @RequestHeader(value = "X-User-Id") @NonNull String userId,
            @RequestParam long startDate,
            @RequestParam long endDate){
        List<ExpenseDto> expenses = expenseService.getExpensesByDateRange(userId, startDate, endDate);
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }

    @PostMapping(path="/addExpense")
    public ResponseEntity<Boolean> addExpenses(
            @RequestHeader(value = "X-User-Id") @NonNull String userId,
            @Valid @RequestBody ExpenseDto expenseDto){
        expenseDto.setUserId(userId);
        if (!expenseService.createExpense(expenseDto)) {
            throw new RuntimeException("Failed to persist expense");
        }
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @PutMapping(path = "/updateExpense")
    public ResponseEntity<Boolean> updateExpense(
            @RequestHeader(value = "X-User-Id") @NonNull String userId,
            @Valid @RequestBody ExpenseDto expenseDto){
        expenseDto.setUserId(userId);
        if (!expenseService.updateExpense(expenseDto)) {
            throw new ResourceNotFoundException("Expense not found: " + expenseDto.getExternalId());
        }
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @DeleteMapping(path = "/deleteExpense")
    public ResponseEntity<Boolean> deleteExpense(
            @RequestHeader(value = "X-User-Id") @NonNull String userId,
            @RequestParam String externalId){
        if (!expenseService.deleteExpense(userId, externalId)) {
            throw new ResourceNotFoundException("Expense not found: " + externalId);
        }
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @GetMapping("/health")
    public ResponseEntity<Boolean> checkHealth(){
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

}
