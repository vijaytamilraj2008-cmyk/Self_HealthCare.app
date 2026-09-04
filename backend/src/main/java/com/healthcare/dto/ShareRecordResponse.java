package com.healthcare.dto;

public class ShareRecordResponse {
    public String token;
    public String snapshotJson;
    public long createdAt;
    public long expiresAt;
    public String status;

    public ShareRecordResponse() {}

    public ShareRecordResponse(String token, String snapshotJson, long createdAt, long expiresAt, String status) {
        this.token = token;
        this.snapshotJson = snapshotJson;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.status = status;
    }
}
