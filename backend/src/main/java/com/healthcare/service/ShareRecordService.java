package com.healthcare.service;

import com.healthcare.dto.ShareRecordRequest;
import com.healthcare.dto.ShareRecordResponse;
import com.healthcare.entity.ShareRecord;
import com.healthcare.repository.ShareRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ShareRecordService {
    private final ShareRecordRepository repository;

    public ShareRecordService(ShareRecordRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ShareRecordResponse save(String userId, ShareRecordRequest request) {
        if (request == null || request.getToken() == null || request.getToken().isBlank()
                || request.getSnapshotJson() == null || request.getSnapshotJson().isBlank()) {
            throw new IllegalArgumentException("Share record is incomplete.");
        }
        long now = System.currentTimeMillis();
        long expiresAt = request.getExpiresAt() > now ? request.getExpiresAt() : now + 24L * 60 * 60 * 1000;
        ShareRecord record = repository.findById(request.getToken()).orElseGet(ShareRecord::new);
        record.setToken(request.getToken().trim());
        record.setUserId(userId);
        record.setSnapshotJson(request.getSnapshotJson());
        record.setExpiresAt(expiresAt);
        record.setCreatedAt(Instant.ofEpochMilli(now).toString());
        repository.save(record);
        return new ShareRecordResponse(record.getToken(), record.getSnapshotJson(), now, record.getExpiresAt(), "valid");
    }

    public ShareRecordResponse resolvePublic(String token) {
        if (token == null || token.isBlank()) throw new IllegalArgumentException("This sharing link is invalid or no longer available.");
        ShareRecord record = repository.findById(token.trim()).orElseThrow(() -> new IllegalArgumentException("This sharing link is invalid or no longer available."));
        long now = System.currentTimeMillis();
        if (now > record.getExpiresAt()) {
            return new ShareRecordResponse(record.getToken(), record.getSnapshotJson(), parseEpoch(record.getCreatedAt()), record.getExpiresAt(), "expired");
        }
        return new ShareRecordResponse(record.getToken(), record.getSnapshotJson(), parseEpoch(record.getCreatedAt()), record.getExpiresAt(), "valid");
    }

    private long parseEpoch(String value) {
        try { return Instant.parse(value).toEpochMilli(); }
        catch (Exception ignored) { return System.currentTimeMillis(); }
    }
}
