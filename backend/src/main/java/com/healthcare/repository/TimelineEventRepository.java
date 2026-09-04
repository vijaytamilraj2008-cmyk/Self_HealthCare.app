package com.healthcare.repository;

import com.healthcare.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, String> {
    List<TimelineEvent> findByUserIdOrderByTimestampDesc(String userId);
    Optional<TimelineEvent> findByIdAndUserId(String id, String userId);
}
