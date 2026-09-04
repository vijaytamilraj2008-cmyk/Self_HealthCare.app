package com.healthcare.controller;

import com.healthcare.dto.TimelineEventRequest;
import com.healthcare.entity.TimelineEvent;
import com.healthcare.entity.User;
import com.healthcare.service.TimelineEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/timeline")
public class TimelineEventController {
    private final TimelineEventService service;
    public TimelineEventController(TimelineEventService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<TimelineEvent>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getEvents(user.getId()));
    }

    @PostMapping
    public ResponseEntity<TimelineEvent> save(@AuthenticationPrincipal User user, @RequestBody TimelineEventRequest request) {
        return ResponseEntity.ok(service.save(user.getId(), request));
    }
}
