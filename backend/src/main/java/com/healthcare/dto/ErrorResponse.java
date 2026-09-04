package com.healthcare.dto;

import java.util.List;

public class ErrorResponse {

    private boolean success;
    private String error;
    private List<String> details;
    private long timestamp;

    public ErrorResponse() {
        this.success = false;
        this.timestamp = System.currentTimeMillis();
    }

    public ErrorResponse(String error) {
        this.success = false;
        this.error = error;
        this.timestamp = System.currentTimeMillis();
    }

    public ErrorResponse(String error, List<String> details) {
        this.success = false;
        this.error = error;
        this.details = details;
        this.timestamp = System.currentTimeMillis();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public List<String> getDetails() {
        return details;
    }

    public void setDetails(List<String> details) {
        this.details = details;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
