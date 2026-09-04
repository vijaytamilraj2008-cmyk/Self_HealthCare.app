package com.healthcare.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.MedicalDocumentRequest;
import com.healthcare.entity.MedicalDocument;
import com.healthcare.repository.MedicalDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MedicalDocumentService {
    private final MedicalDocumentRepository repository;
    private final ObjectMapper objectMapper;

    public MedicalDocumentService(MedicalDocumentRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<MedicalDocumentResponse> getDocuments(String userId) {
        return repository.findByUserIdOrderByUploadDateDesc(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MedicalDocumentResponse save(String userId, MedicalDocumentRequest request) {
        validate(request);
        MedicalDocument document;
        if (hasText(request.id)) {
            document = repository.findByIdAndUserId(request.id, userId).orElse(null);
            if (document == null && repository.existsById(request.id)) {
                throw new IllegalArgumentException("This document does not belong to the signed-in account.");
            }
            if (document == null) document = new MedicalDocument();
        } else {
            document = new MedicalDocument();
        }
        document.setId(hasText(request.id) ? request.id : "doc_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6));
        document.setUserId(userId);
        document.setFileName(clean(request.fileName));
        document.setFileType(clean(request.fileType));
        document.setFileSize(clean(request.fileSize));
        document.setUploadDate(hasText(request.uploadDate) ? request.uploadDate : Instant.now().toString());
        document.setDocumentType(clean(request.documentType));
        document.setDoctorName(blankToNull(request.doctorName));
        document.setHospitalName(blankToNull(request.hospitalName));
        document.setPatientName(blankToNull(request.patientName));
        document.setSimpleSummary(clean(request.simpleSummary));
        document.setImportantFindingsJson(write(request.importantFindings));
        document.setMedicalTermsJson(write(request.medicalTerms));
        document.setMedicinesDetectedJson(write(request.medicinesDetected));
        document.setExplicitDiagnosis(blankToNull(request.explicitDiagnosis));
        document.setAttentionLevel(clean(request.attentionLevel));
        document.setPageCount(request.pageCount);
        document.setRawExtractedText(request.rawExtractedText);
        return toResponse(repository.save(document));
    }

    @Transactional
    public void delete(String userId, String id) {
        MedicalDocument document = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Medical document not found."));
        repository.delete(document);
    }

    private MedicalDocumentResponse toResponse(MedicalDocument d) {
        MedicalDocumentResponse r = new MedicalDocumentResponse();
        r.id=d.getId(); r.userId=d.getUserId(); r.fileName=d.getFileName(); r.fileType=d.getFileType(); r.fileSize=d.getFileSize();
        r.uploadDate=d.getUploadDate(); r.documentType=d.getDocumentType(); r.doctorName=d.getDoctorName(); r.hospitalName=d.getHospitalName();
        r.patientName=d.getPatientName(); r.simpleSummary=d.getSimpleSummary(); r.importantFindings=read(d.getImportantFindingsJson(), new TypeReference<List<String>>(){});
        r.medicalTerms=read(d.getMedicalTermsJson(), new TypeReference<List<MedicalDocumentRequest.MedicalTerm>>(){});
        r.medicinesDetected=read(d.getMedicinesDetectedJson(), new TypeReference<List<MedicalDocumentRequest.DetectedMedicine>>(){});
        r.explicitDiagnosis=d.getExplicitDiagnosis(); r.attentionLevel=d.getAttentionLevel(); r.pageCount=d.getPageCount(); r.rawExtractedText=d.getRawExtractedText();
        return r;
    }

    private <T> String write(T value) { try { return objectMapper.writeValueAsString(value == null ? Collections.emptyList() : value); } catch (JsonProcessingException e) { throw new IllegalArgumentException("Unable to store document analysis data.", e); } }
    private <T> T read(String value, TypeReference<T> type) { try { return value == null ? objectMapper.readValue("[]", type) : objectMapper.readValue(value, type); } catch (Exception e) { throw new IllegalStateException("Stored document data is invalid.", e); } }
    private void validate(MedicalDocumentRequest r) {
        if (r == null || !hasText(r.fileName)) throw new IllegalArgumentException("Document file name is required.");
        if (!hasText(r.documentType) || !hasText(r.simpleSummary) || !hasText(r.attentionLevel)) throw new IllegalArgumentException("Document analysis is incomplete.");
    }
    private boolean hasText(String s) { return s != null && !s.trim().isEmpty(); }
    private String clean(String s) { return s == null ? "" : s.trim(); }
    private String blankToNull(String s) { return hasText(s) ? s.trim() : null; }

    public static class MedicalDocumentResponse {
        public String id; public String userId; public String fileName; public String fileType; public String fileSize; public String uploadDate;
        public String documentType; public String doctorName; public String hospitalName; public String patientName; public String simpleSummary;
        public List<String> importantFindings; public List<MedicalDocumentRequest.MedicalTerm> medicalTerms; public List<MedicalDocumentRequest.DetectedMedicine> medicinesDetected;
        public String explicitDiagnosis; public String attentionLevel; public Integer pageCount; public String rawExtractedText;
    }
}
