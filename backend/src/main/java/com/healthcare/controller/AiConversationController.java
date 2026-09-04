package com.healthcare.controller;

import com.healthcare.dto.AiConversationRequest;
import com.healthcare.dto.AiChatRequest;
import com.healthcare.dto.AiChatResponse;
import com.healthcare.dto.AiMessageRequest;
import com.healthcare.entity.AiConversation;
import com.healthcare.entity.AiMessage;
import com.healthcare.entity.User;
import com.healthcare.service.AiConversationService;
import com.healthcare.service.HealthcareAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiConversationController {
    private final AiConversationService service;
    private final HealthcareAiService healthcareAiService;

    public AiConversationController(AiConversationService service, HealthcareAiService healthcareAiService) {
        this.service = service;
        this.healthcareAiService = healthcareAiService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AiConversation>> conversations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getConversations(user.getId()));
    }

    @PostMapping("/conversations")
    public ResponseEntity<AiConversation> createConversation(@AuthenticationPrincipal User user,
                                                              @Valid @RequestBody(required = false) AiConversationRequest request) {
        return ResponseEntity.ok(service.createConversation(user.getId(), request));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@AuthenticationPrincipal User user,
                                                @Valid @RequestBody AiChatRequest request) {
        return ResponseEntity.ok(healthcareAiService.chat(user.getId(), request.getConversationId(), request.getMessage()));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<AiMessage>> messages(@AuthenticationPrincipal User user,
                                                    @PathVariable String conversationId) {
        return ResponseEntity.ok(service.getMessages(user.getId(), conversationId));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<AiMessage> addMessage(@AuthenticationPrincipal User user,
                                                @PathVariable String conversationId,
                                                @Valid @RequestBody AiMessageRequest request) {
        return ResponseEntity.ok(service.addMessage(user.getId(), conversationId, request));
    }
}
