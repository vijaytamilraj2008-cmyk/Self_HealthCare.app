package com.healthcare.dto;

import java.util.List;

public class MedicalDocumentRequest {
    public String id;
    public String fileName;
    public String fileType;
    public String fileSize;
    public String uploadDate;
    public String documentType;
    public String doctorName;
    public String hospitalName;
    public String patientName;
    public String simpleSummary;
    public List<String> importantFindings;
    public List<MedicalTerm> medicalTerms;
    public List<DetectedMedicine> medicinesDetected;
    public String explicitDiagnosis;
    public String attentionLevel;
    public Integer pageCount;
    public String rawExtractedText;

    public static class MedicalTerm { public String term; public String explanation; }
    public static class DetectedMedicine {
        public String name; public String strength; public String instructions; public String duration;
        public String purpose; public String frequency; public String route;
    }
}
