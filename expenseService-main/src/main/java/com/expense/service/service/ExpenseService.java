package com.expense.service.service;

import com.expense.service.dto.ExpenseDto;
import com.expense.service.dto.PagedExpenseResponse;
import com.expense.service.entities.Expense;
import com.expense.service.repository.ExpenseRepository;
import com.expense.service.util.ValidationUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ExpenseService
{

    private final ExpenseRepository expenseRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    ExpenseService(ExpenseRepository expenseRepository){
        this.expenseRepository = expenseRepository;
    }

    public boolean createExpense(ExpenseDto expenseDto){
        ValidationUtil.requireNonBlank(expenseDto.getUserId(), "userId");
        ValidationUtil.requirePositive(expenseDto.getAmount(), "amount");
        setCurrency(expenseDto);
        try{
            expenseRepository.save(objectMapper.convertValue(expenseDto, Expense.class));
            return true;
        }catch(Exception ex){
            return false;
        }
    }

    public boolean updateExpense(ExpenseDto expenseDto){
        ValidationUtil.requireNonBlank(expenseDto.getUserId(), "userId");
        ValidationUtil.requireNonBlank(expenseDto.getExternalId(), "externalId");
        ValidationUtil.requirePositive(expenseDto.getAmount(), "amount");
        setCurrency(expenseDto);
        Optional<Expense> expenseFoundOpt = expenseRepository.findByUserIdAndExternalIdAndDeletedFalse(expenseDto.getUserId(), expenseDto.getExternalId());
        if(expenseFoundOpt.isEmpty()){
            return false;
        }
        Expense expense = expenseFoundOpt.get();
        expense.setAmount(expenseDto.getAmount());
        expense.setMerchant(Strings.isNotBlank(expenseDto.getMerchant())?expenseDto.getMerchant():expense.getMerchant());
        expense.setCurrency(Strings.isNotBlank(expenseDto.getCurrency())?expenseDto.getCurrency():expense.getCurrency());
        if (expenseDto.getCategory() != null) expense.setCategory(expenseDto.getCategory());
        if (expenseDto.getTransactionType() != null) expense.setTransactionType(expenseDto.getTransactionType());
        expenseRepository.save(expense);
        return true;
    }

    public boolean deleteExpense(String userId, String externalId){
        ValidationUtil.requireNonBlank(userId, "userId");
        ValidationUtil.requireNonBlank(externalId, "externalId");
        Optional<Expense> expenseOpt = expenseRepository.findByUserIdAndExternalIdAndDeletedFalse(userId, externalId);
        if(expenseOpt.isEmpty()){
            return false;
        }
        Expense expense = expenseOpt.get();
        expense.setDeleted(true);
        expenseRepository.save(expense);
        return true;
    }

    public PagedExpenseResponse getExpenses(String userId, int page, int size){
        int cappedSize = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, cappedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Expense> expensePage = expenseRepository.findByUserIdAndDeletedFalse(userId, pageable);
        List<ExpenseDto> items = objectMapper.convertValue(
                expensePage.getContent(), new TypeReference<List<ExpenseDto>>() {});
        return PagedExpenseResponse.builder()
                .items(items)
                .page(expensePage.getNumber())
                .size(expensePage.getSize())
                .totalElements(expensePage.getTotalElements())
                .totalPages(expensePage.getTotalPages())
                .build();
    }

    public List<ExpenseDto> getExpensesByDateRange(String userId, long startMs, long endMs){
        ValidationUtil.requireValidDateRange(startMs, endMs);
        Timestamp start = new Timestamp(startMs);
        Timestamp end   = new Timestamp(endMs);
        List<Expense> expenses = expenseRepository.findByUserIdAndDeletedFalseAndCreatedAtBetween(userId, start, end);
        return objectMapper.convertValue(expenses, new TypeReference<List<ExpenseDto>>() {});
    }

    private void setCurrency(ExpenseDto expenseDto){
        if(Objects.isNull(expenseDto.getCurrency())){
            expenseDto.setCurrency("inr");
        }
    }


}
