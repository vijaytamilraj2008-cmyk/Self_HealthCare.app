package com.healthcare.dto;

public class AuthResponse {

    private boolean success;
    private String token;
    private UserDto user;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String token, UserDto user, String message) {
        this.success = success;
        this.token = token;
        this.user = user;
        this.message = message;
    }

    public static AuthResponse success(String token, UserDto user, String message) {
        return new AuthResponse(true, token, user, message);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(false, null, null, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
