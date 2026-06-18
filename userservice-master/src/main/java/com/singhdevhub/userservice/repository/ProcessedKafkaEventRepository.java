package com.singhdevhub.userservice.repository;

import com.singhdevhub.userservice.entities.ProcessedKafkaEvent;
import org.springframework.data.repository.CrudRepository;

public interface ProcessedKafkaEventRepository extends CrudRepository<ProcessedKafkaEvent, Long> {

    boolean existsByTopicAndGroupIdAndPartitionNumAndOffsetVal(
            String topic, String groupId, int partitionNum, long offsetVal);
}
