package com.healthcare.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.AiConversationRequest;
import com.healthcare.dto.AiMessageRequest;
import com.healthcare.entity.AiConversation;
import com.healthcare.entity.AiMessage;
import com.healthcare.repository.AiConversationRepository;
import com.healthcare.repository.AiMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AiConversationService {
    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    public AiConversationService(AiConversationRepository conversationRepository,
                                  AiMessageRepository messageRepository,
                                  ObjectMapper objectMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AiConversation createConversation(String userId, AiConversationRequest request) {
        AiConversation conversation = new AiConversation();
        conversation.setId("ai_conv_" + UUID.randomUUID());
        conversation.setUserId(userId);
        String title = request != null ? request.getTitle() : null;
        conversation.setTitle(title == null || title.isBlank() ? "Health Assistant Chat" : title.trim());
        String now = Instant.now().toString();
        conversation.setCreatedAt(now);
        conversation.setUpdatedAt(now);
        return conversationRepository.save(conversation);
    }

    public List<AiConversation> getConversations(String userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public AiConversation getOwnedConversation(String userId, String conversationId) {
        AiConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("AI conversation not found."));
        if (!userId.equals(conversation.getUserId())) {
            throw new IllegalArgumentException("AI conversation does not belong to the current user.");
        }
        return conversation;
    }

    public List<AiMessage> getMessages(String userId, String conversationId) {
        getOwnedConversation(userId, conversationId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public AiMessage addMessage(String userId, String conversationId, AiMessageRequest request) {
        AiConversation conversation = getOwnedConversation(userId, conversationId);

        String sender = request.getSender();
        if (!"user".equals(sender) && !"ai".equals(sender)) {
            throw new IllegalArgumentException("Message sender must be 'user' or 'ai'.");
        }

        AiMessage message = new AiMessage();
        message.setId("ai_msg_" + UUID.randomUUID());
        message.setConversationId(conversationId);
        message.setSender(sender);
        message.setText(request.getText().trim());
        message.setTimestamp(request.getTimestamp() == null || request.getTimestamp().isBlank()
                ? Instant.now().toString() : request.getTimestamp());
        message.setActionSuggestionsJson(sanitizeActionSuggestions(request.getActionSuggestionsJson()));
        message.setEmergencyAlert(request.isEmergencyAlert());
        message.setCreatedAt(Instant.now().toString());

        conversation.setUpdatedAt(Instant.now().toString());
        conversationRepository.save(conversation);
        return messageRepository.save(message);
    }

    private String sanitizeActionSuggestions(String json) {
        if (json == null || json.isBlank()) return "[]";
        try {
            Object parsed = objectMapper.readValue(json, Object.class);
            return objectMapper.writeValueAsString(parsed);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Invalid AI action suggestions payload.");
        }
    }
}
