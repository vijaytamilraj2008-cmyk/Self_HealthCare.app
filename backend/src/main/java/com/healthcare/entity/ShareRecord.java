package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "share_records", indexes = {
    @Index(name = "idx_share_user", columnList = "user_id"),
    @Index(name = "idx_share_expires", columnList = "expires_at")
})
public class ShareRecord {
    @Id
    @Column(length = 96, nullable = false, updatable = false)
    private String token;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Lob
    @Column(name = "snapshot_json", nullable = false, columnDefinition = "LONGTEXT")
    private String snapshotJson;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    @Column(name = "expires_at", nullable = false)
    private long expiresAt;

    public ShareRecord() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now().toString();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getSnapshotJson() { return snapshotJson; }
    public void setSnapshotJson(String snapshotJson) { this.snapshotJson = snapshotJson; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
}
