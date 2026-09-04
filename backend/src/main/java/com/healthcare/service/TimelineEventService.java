package com.healthcare.service;

import com.healthcare.dto.TimelineEventRequest;
import com.healthcare.entity.TimelineEvent;
import com.healthcare.repository.TimelineEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TimelineEventService {
    private final TimelineEventRepository repository;
    public TimelineEventService(TimelineEventRepository repository) { this.repository = repository; }

    public List<TimelineEvent> getEvents(String userId) {
        return repository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Transactional
    public TimelineEvent save(String userId, TimelineEventRequest request) {
        if (request == null || isBlank(request.title) || isBlank(request.description) || isBlank(request.category)) {
            throw new IllegalArgumentException("Timeline event is incomplete.");
        }
        TimelineEvent event;
        if (!isBlank(request.id)) {
            event = repository.findByIdAndUserId(request.id, userId).orElse(null);
            if (event == null && repository.existsById(request.id)) {
                throw new IllegalArgumentException("This timeline event does not belong to the signed-in account.");
            }
            if (event == null) event = new TimelineEvent();
        } else {
            event = new TimelineEvent();
        }
        event.setId(isBlank(request.id) ? "tl_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6) : request.id);
        event.setUserId(userId);
        event.setTitle(request.title.trim());
        event.setDescription(request.description.trim());
        event.setCategory(request.category.trim());
        event.setTimestamp(isBlank(request.timestamp) ? Instant.now().toString() : request.timestamp);
        event.setBadgeText(isBlank(request.badgeText) ? null : request.badgeText.trim());
        return repository.save(event);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
