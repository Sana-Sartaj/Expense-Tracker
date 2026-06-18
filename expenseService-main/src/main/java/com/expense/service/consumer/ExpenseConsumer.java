package com.expense.service.consumer;

import com.expense.service.dto.ExpenseDto;
import com.expense.service.entities.ProcessedKafkaEvent;
import com.expense.service.repository.ProcessedKafkaEventRepository;
import com.expense.service.service.ExpenseService;
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
public class ExpenseConsumer {

    private final ExpenseService expenseService;
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

    @Value("${spring.kafka.consumer.group-id}")
    private String consumerGroupId;

    @Autowired
    ExpenseConsumer(ExpenseService expenseService,
                    ProcessedKafkaEventRepository processedKafkaEventRepository) {
        this.expenseService = expenseService;
        this.processedKafkaEventRepository = processedKafkaEventRepository;
    }

    @KafkaListener(topics = "${spring.kafka.topic-json.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(ConsumerRecord<String, ExpenseDto> record) {
        String topic = record.topic();
        int partitionNum = record.partition();
        long offsetVal = record.offset();

        if (processedKafkaEventRepository.existsByTopicAndGroupIdAndPartitionNumAndOffsetVal(
                topic, consumerGroupId, partitionNum, offsetVal)) {
            log.info("Skipping duplicate Kafka event: topic={}, partition={}, offset={}",
                    topic, partitionNum, offsetVal);
            return;
        }

        ExpenseDto eventData = record.value();
        try {
            boolean created = expenseService.createExpense(eventData);
            if (created) {
                processedKafkaEventRepository.save(ProcessedKafkaEvent.builder()
                        .topic(topic)
                        .groupId(consumerGroupId)
                        .partitionNum(partitionNum)
                        .offsetVal(offsetVal)
                        .processedAt(Timestamp.from(Instant.now()))
                        .build());
            } else {
                log.warn("createExpense returned false for event: topic={}, partition={}, offset={}",
                        topic, partitionNum, offsetVal);
            }
        } catch (Exception ex) {
            log.error("Failed to process Kafka event: topic={}, partition={}, offset={}",
                    topic, partitionNum, offsetVal, ex);
        }
    }
}
