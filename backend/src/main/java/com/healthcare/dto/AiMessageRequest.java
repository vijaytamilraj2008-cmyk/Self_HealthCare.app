package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AiMessageRequest {
    @NotBlank
    @Size(max = 40000)
    private String text;

    private String sender;
    private String timestamp;
    private String actionSuggestionsJson;
    private boolean emergencyAlert;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getActionSuggestionsJson() { return actionSuggestionsJson; }
    public void setActionSuggestionsJson(String actionSuggestionsJson) { this.actionSuggestionsJson = actionSuggestionsJson; }
    public boolean isEmergencyAlert() { return emergencyAlert; }
    public void setEmergencyAlert(boolean emergencyAlert) { this.emergencyAlert = emergencyAlert; }
}
