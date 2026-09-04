package com.healthcare.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "timeline_events", indexes = {
    @Index(name = "idx_timeline_user", columnList = "user_id"),
    @Index(name = "idx_timeline_timestamp", columnList = "timestamp_value")
})
public class TimelineEvent {
    @Id
    @Column(length = 100, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;
    @Column(nullable = false, length = 255)
    private String title;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    @Column(nullable = false, length = 30)
    private String category;
    @Column(name = "timestamp_value", length = 64, nullable = false)
    private String timestamp;
    @Column(name = "badge_text", length = 100)
    private String badgeText;

    public TimelineEvent() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getBadgeText() { return badgeText; }
    public void setBadgeText(String badgeText) { this.badgeText = badgeText; }
}
