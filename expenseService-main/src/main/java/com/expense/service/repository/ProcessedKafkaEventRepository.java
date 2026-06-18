package com.expense.service.repository;

import com.expense.service.entities.ProcessedKafkaEvent;
import org.springframework.data.repository.CrudRepository;

public interface ProcessedKafkaEventRepository extends CrudRepository<ProcessedKafkaEvent, Long> {

    boolean existsByTopicAndGroupIdAndPartitionNumAndOffsetVal(
            String topic, String groupId, int partitionNum, long offsetVal);
}
