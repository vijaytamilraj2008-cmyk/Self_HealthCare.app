package com.healthcare.repository;

import com.healthcare.entity.MedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, String> {
    List<MedicalDocument> findByUserIdOrderByUploadDateDesc(String userId);
    Optional<MedicalDocument> findByIdAndUserId(String id, String userId);
}
