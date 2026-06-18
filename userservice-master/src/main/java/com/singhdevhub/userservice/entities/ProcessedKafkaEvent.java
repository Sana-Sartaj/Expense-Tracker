package com.singhdevhub.userservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(
    name = "processed_kafka_events",
    uniqueConstraints = @UniqueConstraint(
        name = "uc_processed_kafka_events",
        columnNames = {"topic", "group_id", "partition_num", "offset_val"}
    )
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedKafkaEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic", nullable = false)
    private String topic;

    @Column(name = "group_id", nullable = false)
    private String groupId;

    // "partition" and "offset" are reserved words in MySQL — use aliased column names.
    @Column(name = "partition_num", nullable = false)
    private int partitionNum;

    @Column(name = "offset_val", nullable = false)
    private long offsetVal;

    @Column(name = "processed_at", nullable = false)
    private Timestamp processedAt;
}
