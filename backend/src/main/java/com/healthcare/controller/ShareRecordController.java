package com.healthcare.controller;

import com.healthcare.dto.ShareRecordRequest;
import com.healthcare.dto.ShareRecordResponse;
import com.healthcare.entity.User;
import com.healthcare.service.ShareRecordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/share")
public class ShareRecordController {
    private final ShareRecordService service;
    public ShareRecordController(ShareRecordService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<ShareRecordResponse> save(@AuthenticationPrincipal User user, @Valid @RequestBody ShareRecordRequest request) {
        return ResponseEntity.ok(service.save(user.getId(), request));
    }

    @GetMapping("/{token}")
    public ResponseEntity<ShareRecordResponse> resolve(@PathVariable String token) {
        return ResponseEntity.ok(service.resolvePublic(token));
    }
}
