package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_messages", indexes = {
    @Index(name = "idx_ai_message_conversation", columnList = "conversation_id"),
    @Index(name = "idx_ai_message_created", columnList = "created_at")
})
public class AiMessage {
    @Id
    @Column(length = 64, nullable = false, updatable = false)
    private String id;

    @Column(name = "conversation_id", length = 64, nullable = false)
    private String conversationId;

    @Column(nullable = false, length = 10)
    private String sender;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String text;

    @Column(name = "message_timestamp", nullable = false, length = 64)
    private String timestamp;

    @Column(name = "action_suggestions_json", columnDefinition = "LONGTEXT")
    private String actionSuggestionsJson;

    @Column(name = "is_emergency_alert", nullable = false)
    private boolean emergencyAlert;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    public AiMessage() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now().toString();
        if (timestamp == null) timestamp = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getActionSuggestionsJson() { return actionSuggestionsJson; }
    public void setActionSuggestionsJson(String actionSuggestionsJson) { this.actionSuggestionsJson = actionSuggestionsJson; }
    public boolean isEmergencyAlert() { return emergencyAlert; }
    public void setEmergencyAlert(boolean emergencyAlert) { this.emergencyAlert = emergencyAlert; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
