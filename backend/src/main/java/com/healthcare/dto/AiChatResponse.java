package com.healthcare.dto;

import com.healthcare.entity.AiMessage;

public class AiChatResponse {
    private String conversationId;
    private AiMessage message;
    private String mode;

    public AiChatResponse() {}

    public AiChatResponse(String conversationId, AiMessage message, String mode) {
        this.conversationId = conversationId;
        this.message = message;
        this.mode = mode;
    }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public AiMessage getMessage() { return message; }
    public void setMessage(AiMessage message) { this.message = message; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
