package com.healthcare.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "medical_documents", indexes = {
    @Index(name = "idx_document_user", columnList = "user_id"),
    @Index(name = "idx_document_upload_date", columnList = "upload_date")
})
public class MedicalDocument {
    @Id
    @Column(length = 100, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "file_name", length = 255, nullable = false)
    private String fileName;
    @Column(name = "file_type", length = 100, nullable = false)
    private String fileType;
    @Column(name = "file_size", length = 50, nullable = false)
    private String fileSize;
    @Column(name = "upload_date", length = 64, nullable = false)
    private String uploadDate;
    @Column(name = "document_type", length = 100, nullable = false)
    private String documentType;
    @Column(name = "doctor_name", length = 255)
    private String doctorName;
    @Column(name = "hospital_name", length = 255)
    private String hospitalName;
    @Column(name = "patient_name", length = 255)
    private String patientName;
    @Column(name = "simple_summary", columnDefinition = "TEXT", nullable = false)
    private String simpleSummary;
    @Column(name = "important_findings_json", columnDefinition = "LONGTEXT")
    private String importantFindingsJson;
    @Column(name = "medical_terms_json", columnDefinition = "LONGTEXT")
    private String medicalTermsJson;
    @Column(name = "medicines_detected_json", columnDefinition = "LONGTEXT")
    private String medicinesDetectedJson;
    @Column(name = "explicit_diagnosis", columnDefinition = "TEXT")
    private String explicitDiagnosis;
    @Column(name = "attention_level", length = 20, nullable = false)
    private String attentionLevel;
    @Column(name = "page_count")
    private Integer pageCount;
    @Column(name = "raw_extracted_text", columnDefinition = "LONGTEXT")
    private String rawExtractedText;

    public MedicalDocument() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public String getUploadDate() { return uploadDate; }
    public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getSimpleSummary() { return simpleSummary; }
    public void setSimpleSummary(String simpleSummary) { this.simpleSummary = simpleSummary; }
    public String getImportantFindingsJson() { return importantFindingsJson; }
    public void setImportantFindingsJson(String value) { this.importantFindingsJson = value; }
    public String getMedicalTermsJson() { return medicalTermsJson; }
    public void setMedicalTermsJson(String value) { this.medicalTermsJson = value; }
    public String getMedicinesDetectedJson() { return medicinesDetectedJson; }
    public void setMedicinesDetectedJson(String value) { this.medicinesDetectedJson = value; }
    public String getExplicitDiagnosis() { return explicitDiagnosis; }
    public void setExplicitDiagnosis(String explicitDiagnosis) { this.explicitDiagnosis = explicitDiagnosis; }
    public String getAttentionLevel() { return attentionLevel; }
    public void setAttentionLevel(String attentionLevel) { this.attentionLevel = attentionLevel; }
    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
    public String getRawExtractedText() { return rawExtractedText; }
    public void setRawExtractedText(String rawExtractedText) { this.rawExtractedText = rawExtractedText; }
}
