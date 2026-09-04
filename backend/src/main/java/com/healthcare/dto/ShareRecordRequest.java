package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;

public class ShareRecordRequest {
    @NotBlank
    private String token;
    @NotBlank
    private String snapshotJson;
    private long expiresAt;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getSnapshotJson() { return snapshotJson; }
    public void setSnapshotJson(String snapshotJson) { this.snapshotJson = snapshotJson; }
    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
}
