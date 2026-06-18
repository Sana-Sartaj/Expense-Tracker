package com.expense.service.util;

import java.math.BigDecimal;
import java.util.Objects;

public final class ValidationUtil {

    private ValidationUtil() {}

    public static void requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
    }

    public static void requireNonNull(Object value, String fieldName) {
        if (Objects.isNull(value)) {
            throw new IllegalArgumentException(fieldName + " must not be null");
        }
    }

    public static void requirePositive(BigDecimal value, String fieldName) {
        requireNonNull(value, fieldName);
        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }
    }

    public static void requireValidDateRange(long startMs, long endMs) {
        if (startMs >= endMs) {
            throw new IllegalArgumentException("startDate must be strictly before endDate");
        }
    }
}
