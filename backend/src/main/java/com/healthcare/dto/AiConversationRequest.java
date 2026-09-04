package com.healthcare.dto;

import jakarta.validation.constraints.Size;

public class AiConversationRequest {
    @Size(max = 160)
    private String title;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
