package com.expense.service.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PagedExpenseResponse {

    private List<ExpenseDto> items;

    /** Zero-based page number that was returned. */
    private int page;

    /** Number of items per page that was applied (after the 100-item cap). */
    private int size;

    /** Total number of non-deleted expenses for this user across all pages. */
    private long totalElements;

    /** Total number of pages available at the requested page size. */
    private int totalPages;
}
