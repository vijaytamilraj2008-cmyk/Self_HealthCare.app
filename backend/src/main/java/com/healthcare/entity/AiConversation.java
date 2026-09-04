package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_conversations", indexes = {
    @Index(name = "idx_ai_conversation_user", columnList = "user_id"),
    @Index(name = "idx_ai_conversation_updated", columnList = "updated_at")
})
public class AiConversation {
    @Id
    @Column(length = 64, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    @Column(name = "updated_at", nullable = false, length = 64)
    private String updatedAt;

    public AiConversation() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now().toString();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
