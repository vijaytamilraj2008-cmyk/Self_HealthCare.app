package com.healthcare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.healthcare.dto.AiChatResponse;
import com.healthcare.entity.AiConversation;
import com.healthcare.entity.AiMessage;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.MedicalDocument;
import com.healthcare.entity.TimelineEvent;
import com.healthcare.entity.User;
import com.healthcare.repository.AiConversationRepository;
import com.healthcare.repository.AiMessageRepository;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.MedicalDocumentRepository;
import com.healthcare.repository.TimelineEventRepository;
import com.healthcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class HealthcareAiService {
    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalDocumentRepository documentRepository;
    private final TimelineEventRepository timelineRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.api-url:}")
    private String aiApiUrl;

    @Value("${ai.api-key:}")
    private String aiApiKey;

    @Value("${ai.model:}")
    private String aiModel;

    public HealthcareAiService(AiConversationRepository conversationRepository,
                               AiMessageRepository messageRepository,
                               AppointmentRepository appointmentRepository,
                               MedicalDocumentRepository documentRepository,
                               TimelineEventRepository timelineRepository,
                               UserRepository userRepository,
                               ObjectMapper objectMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.appointmentRepository = appointmentRepository;
        this.documentRepository = documentRepository;
        this.timelineRepository = timelineRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AiChatResponse chat(String userId, String requestedConversationId, String userMessage) {
        String conversationId = getOrCreateConversation(userId, requestedConversationId);
        String cleaned = userMessage == null ? "" : userMessage.trim();
        if (cleaned.isEmpty()) throw new IllegalArgumentException("Message cannot be empty.");

        boolean emergency = isEmergency(cleaned);
        String answer;
        String mode;
        if (emergency) {
            answer = emergencyResponse();
            mode = "safety";
        } else if (hasAiProvider()) {
            try {
                answer = callConfiguredAi(userId, conversationId, cleaned);
                mode = "ai";
            } catch (Exception ex) {
                answer = enhancedFallback(userId, cleaned) + "\n\n*AI service is temporarily unavailable, so I used the application's safety-focused assistant instead.*";
                mode = "fallback";
            }
        } else {
            answer = enhancedFallback(userId, cleaned);
            mode = "fallback";
        }

        AiMessage user = new AiMessage();
        user.setId("ai_msg_" + UUID.randomUUID());
        user.setConversationId(conversationId);
        user.setSender("user");
        user.setText(cleaned);
        user.setTimestamp(Instant.now().toString());
        user.setActionSuggestionsJson("[]");
        user.setEmergencyAlert(false);
        user.setCreatedAt(Instant.now().toString());
        messageRepository.save(user);

        AiMessage ai = new AiMessage();
        ai.setId("ai_msg_" + UUID.randomUUID());
        ai.setConversationId(conversationId);
        ai.setSender("ai");
        ai.setText(answer);
        ai.setTimestamp(Instant.now().toString());
        ai.setActionSuggestionsJson(actionSuggestionsFor(cleaned, emergency));
        ai.setEmergencyAlert(emergency);
        ai.setCreatedAt(Instant.now().toString());
        messageRepository.save(ai);

        AiConversation conversation = conversationRepository.findById(conversationId).orElseThrow();
        conversation.setUpdatedAt(Instant.now().toString());
        conversationRepository.save(conversation);
        return new AiChatResponse(conversationId, ai, mode);
    }

    private String getOrCreateConversation(String userId, String requestedId) {
        if (requestedId != null && !requestedId.isBlank()) {
            AiConversation conversation = conversationRepository.findById(requestedId)
                    .orElseThrow(() -> new IllegalArgumentException("AI conversation not found."));
            if (!userId.equals(conversation.getUserId())) throw new IllegalArgumentException("AI conversation does not belong to the current user.");
            return conversation.getId();
        }
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .findFirst()
                .map(AiConversation::getId)
                .orElseGet(() -> {
                    AiConversation c = new AiConversation();
                    c.setId("ai_conv_" + UUID.randomUUID());
                    c.setUserId(userId);
                    c.setTitle("Health Assistant Chat");
                    c.setCreatedAt(Instant.now().toString());
                    c.setUpdatedAt(c.getCreatedAt());
                    return conversationRepository.save(c).getId();
                });
    }

    private boolean hasAiProvider() {
        return aiApiUrl != null && !aiApiUrl.isBlank() && aiApiKey != null && !aiApiKey.isBlank() && aiModel != null && !aiModel.isBlank();
    }

    private String callConfiguredAi(String userId, String conversationId, String currentMessage) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", aiModel);
        root.put("temperature", 0.2);
        ArrayNode messages = root.putArray("messages");
        ObjectNode system = messages.addObject();
        system.put("role", "system");
        system.put("content", buildSystemPrompt(userId));

        List<AiMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        int start = Math.max(0, history.size() - 10);
        for (int i = start; i < history.size(); i++) {
            AiMessage h = history.get(i);
            ObjectNode msg = messages.addObject();
            msg.put("role", "user".equals(h.getSender()) ? "user" : "assistant");
            msg.put("content", h.getText());
        }
        ObjectNode current = messages.addObject();
        current.put("role", "user");
        current.put("content", currentMessage);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(aiApiUrl.replaceAll("/$", "") + "/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + aiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(root)))
                .build();

        HttpResponse<String> response = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build()
                .send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) throw new IllegalStateException("AI provider returned HTTP " + response.statusCode());

        JsonNode json = objectMapper.readTree(response.body());
        String answer = json.at("/choices/0/message/content").asText("").trim();
        if (answer.isEmpty()) throw new IllegalStateException("AI provider returned an empty response.");
        return answer;
    }

    private String buildSystemPrompt(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        List<MedicalDocument> docs = documentRepository.findByUserIdOrderByUploadDateDesc(userId);
        List<TimelineEvent> timeline = timelineRepository.findByUserIdOrderByTimestampDesc(userId);
        List<Appointment> appointments = appointmentRepository.findByUserIdOrderByDateAscTimeAsc(userId);

        StringBuilder p = new StringBuilder();
        p.append("You are the Healthcare App's health-literacy assistant. You are not a doctor. Do not diagnose, prescribe, change medication doses, or claim certainty. For emergency symptoms, tell the user to seek urgent medical care. Use only information in the supplied user context when referring to their records. If a record does not contain an answer, say so. Explain medical concepts in plain language.\n\n");
        if (user != null) {
            p.append("USER PROFILE:\n");
            appendNonBlank(p, "Name", user.getUsername());
            appendNonBlank(p, "Location", user.getLocation());
            if (user.getAge() != null) appendNonBlank(p, "Age", String.valueOf(user.getAge()));
            appendNonBlank(p, "Gender", user.getGender());
            appendNonBlank(p, "Blood group", user.getBloodGroup());
            appendNonBlank(p, "Allergies", user.getAllergies());
            appendNonBlank(p, "Existing conditions", user.getExistingConditions());
            appendNonBlank(p, "Current medications", user.getCurrentMedications());
        }
        p.append("\nRECENT MEDICAL RECORDS:\n");
        for (MedicalDocument d : docs.stream().limit(5).toList()) {
            p.append("- ").append(d.getFileName()).append(" | ").append(d.getDocumentType()).append(" | summary: ").append(nullSafe(d.getSimpleSummary())).append(" | diagnosis: ").append(nullSafe(d.getExplicitDiagnosis())).append("\n");
            appendNonBlank(p, "  raw extracted text", truncate(d.getRawExtractedText(), 5000));
            appendNonBlank(p, "  medicines", truncate(d.getMedicinesDetectedJson(), 2500));
        }
        p.append("\nUPCOMING/RECENT APPOINTMENTS:\n");
        appointments.stream().sorted(Comparator.comparing(Appointment::getDate).thenComparing(Appointment::getTime)).limit(8).forEach(a ->
                p.append("- ").append(a.getDate()).append(" ").append(a.getTime()).append(" | ").append(a.getHospitalName()).append(" | ").append(a.getDoctorName()).append(" | ").append(a.getDepartment()).append(" | status: ").append(a.getStatus()).append("\n"));
        p.append("\nRECENT TIMELINE:\n");
        timeline.stream().limit(8).forEach(t -> p.append("- ").append(t.getTimestamp()).append(" | ").append(t.getTitle()).append(" | ").append(t.getDescription()).append("\n"));
        return p.toString();
    }

    private String enhancedFallback(String userId, String query) {
        String q = query.toLowerCase();
        if (q.contains("appointment") || q.contains("next appointment")) {
            List<Appointment> appointments = appointmentRepository.findByUserIdOrderByDateAscTimeAsc(userId).stream()
                    .filter(a -> !"CANCELLED".equalsIgnoreCase(a.getStatus()))
                    .toList();
            if (appointments.isEmpty()) return "I couldn't find an active appointment in your account. You can book one from the Appointments section.";
            Appointment a = appointments.get(0);
            return "Your earliest active appointment in the account is **" + a.getDate() + " at " + a.getTime() + "** with **" + a.getDoctorName() + "** at **" + a.getHospitalName() + "** (" + a.getDepartment() + ").\n\nPlease verify the final details with the hospital if anything changes.";
        }
        if (q.contains("allerg") || q.contains("allergy")) {
            User u = userRepository.findById(userId).orElse(null);
            String allergies = u == null ? null : u.getAllergies();
            return allergies == null || allergies.isBlank() ? "No allergy information is currently recorded in your profile." : "Your profile currently records these allergies: **" + allergies + "**. This is stored profile information, not a new medical assessment.";
        }
        if (q.contains("medicine") || q.contains("prescription") || q.contains("report")) {
            List<MedicalDocument> docs = documentRepository.findByUserIdOrderByUploadDateDesc(userId);
            if (docs.isEmpty()) return "I don't see any medical documents saved to your account yet. Upload a prescription or report from Medical Documents first.";
            MedicalDocument d = docs.get(0);
            return "I found your latest document **" + d.getFileName() + "**.\n\n**Summary:** " + nullSafe(d.getSimpleSummary()) + "\n\n**Explicit diagnosis recorded:** " + nullSafe(d.getExplicitDiagnosis()) + "\n\nI can explain the document's recorded information, but I won't invent a diagnosis or change your treatment plan.";
        }
        String department = departmentFor(q);
        if (department != null) {
            return "Based on the symptom you described, **" + department + "** may be an appropriate department to discuss it with. This is a routing suggestion, not a diagnosis.\n\nIf symptoms are severe, sudden, or rapidly worsening, seek urgent medical care instead.";
        }
        if (q.contains("what is") || q.contains("meaning") || q.contains("mean") || q.contains("explain")) {
            return "I can explain medical terms in plain language. Send the exact term or sentence from your report, and I’ll explain what it usually means and point out when the document itself contains patient-specific information.";
        }
        return "I can help with your saved health records, appointment details, medical terminology, and deciding which department may be relevant for a symptom. For diagnosis or treatment changes, please consult a qualified healthcare professional.";
    }

    private String departmentFor(String q) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("chest pain", "Cardiology / Emergency care");
        map.put("heart", "Cardiology");
        map.put("knee", "Orthopedics");
        map.put("bone", "Orthopedics");
        map.put("joint", "Orthopedics");
        map.put("skin", "Dermatology");
        map.put("rash", "Dermatology");
        map.put("tooth", "Dentistry");
        map.put("dental", "Dentistry");
        map.put("ear", "ENT");
        map.put("nose", "ENT");
        map.put("throat", "ENT");
        map.put("stomach", "Gastroenterology");
        map.put("abdomen", "Gastroenterology");
        map.put("eye", "Ophthalmology");
        map.put("vision", "Ophthalmology");
        map.put("urine", "Urology");
        map.put("kidney", "Urology / Nephrology");
        map.put("period", "Gynecology");
        map.put("menstrual", "Gynecology");
        map.put("headache", "General Medicine / Neurology");
        map.put("migraine", "Neurology");
        return map.entrySet().stream().filter(e -> q.contains(e.getKey())).map(Map.Entry::getValue).findFirst().orElse(null);
    }

    private boolean isEmergency(String q) {
        String s = q.toLowerCase();
        String[] terms = {"chest pain", "difficulty breathing", "cannot breathe", "can't breathe", "unconscious", "severe bleeding", "choking", "stroke", "seizure", "heart attack", "fainted and not waking", "suicidal"};
        for (String term : terms) if (s.contains(term)) return true;
        return false;
    }

    private String emergencyResponse() {
        return "🚨 **Potential medical emergency detected**\n\nIf you or someone nearby has severe or life-threatening symptoms, **call 112 immediately** or go to the nearest emergency department. Do not rely on this chat for emergency treatment.\n\nIf possible, alert your emergency contact and stay with the person until help arrives.";
    }

    private String actionSuggestionsFor(String query, boolean emergency) {
        if (emergency) return "[{\"label\":\"Call 112 Emergency\",\"action\":\"navigate:emergency\"},{\"label\":\"Find Emergency Hospital\",\"action\":\"navigate:healthcare?filter=Emergency\"}]";
        String q = query.toLowerCase();
        if (q.contains("appointment")) return "[{\"label\":\"View My Appointments\",\"action\":\"navigate:appointments\"}]";
        if (q.contains("medicine") || q.contains("prescription") || q.contains("report")) return "[{\"label\":\"Open Medical Documents\",\"action\":\"navigate:documents\"}]";
        return "[]";
    }

    private void appendNonBlank(StringBuilder p, String label, String value) {
        if (value != null && !value.isBlank()) p.append(label).append(": ").append(value).append("\n");
    }

    private String nullSafe(String value) { return value == null || value.isBlank() ? "Not recorded" : value; }
    private String truncate(String value, int max) { if (value == null) return ""; return value.length() <= max ? value : value.substring(0, max) + "…"; }
}
