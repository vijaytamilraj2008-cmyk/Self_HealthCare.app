package com.healthcare.repository;

import com.healthcare.entity.ShareRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShareRecordRepository extends JpaRepository<ShareRecord, String> {
    Optional<ShareRecord> findByTokenAndUserId(String token, String userId);
}
