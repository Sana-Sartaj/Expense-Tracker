package com.singhdevhub.userservice.consumer;

import com.singhdevhub.userservice.entities.ProcessedKafkaEvent;
import com.singhdevhub.userservice.entities.UserInfoDto;
import com.singhdevhub.userservice.repository.ProcessedKafkaEventRepository;
import com.singhdevhub.userservice.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;

@Service
@Slf4j
public class AuthServiceConsumer {

    private final UserService userService;
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

    @Value("${spring.kafka.consumer.group-id}")
    private String consumerGroupId;

    @Autowired
    AuthServiceConsumer(UserService userService,
                        ProcessedKafkaEventRepository processedKafkaEventRepository) {
        this.userService = userService;
        this.processedKafkaEventRepository = processedKafkaEventRepository;
    }

    @KafkaListener(topics = "${spring.kafka.topic-json.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(ConsumerRecord<String, UserInfoDto> record) {
        String topic = record.topic();
        int partitionNum = record.partition();
        long offsetVal = record.offset();

        if (processedKafkaEventRepository.existsByTopicAndGroupIdAndPartitionNumAndOffsetVal(
                topic, consumerGroupId, partitionNum, offsetVal)) {
            log.info("Skipping duplicate Kafka event: topic={}, partition={}, offset={}",
                    topic, partitionNum, offsetVal);
            return;
        }

        UserInfoDto eventData = record.value();
        try {
            userService.createOrUpdateUser(eventData);
            processedKafkaEventRepository.save(ProcessedKafkaEvent.builder()
                    .topic(topic)
                    .groupId(consumerGroupId)
                    .partitionNum(partitionNum)
                    .offsetVal(offsetVal)
                    .processedAt(Timestamp.from(Instant.now()))
                    .build());
        } catch (Exception ex) {
            log.error("Failed to process Kafka event: topic={}, partition={}, offset={}",
                    topic, partitionNum, offsetVal, ex);
        }
    }
}
