package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ForgotPasswordRequest {

    @NotBlank(message = "Mobile number is required.")
    private String mobile;

    @NotBlank(message = "Emergency contact number is required for verification.")
    private String emergencyContactNumber;

    @NotBlank(message = "New password is required.")
    @Size(min = 6, message = "New password must be at least 6 characters long.")
    private String newPassword;

    @NotBlank(message = "Confirm new password is required.")
    private String confirmNewPassword;

    public ForgotPasswordRequest() {
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmergencyContactNumber() {
        return emergencyContactNumber;
    }

    public void setEmergencyContactNumber(String emergencyContactNumber) {
        this.emergencyContactNumber = emergencyContactNumber;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmNewPassword() {
        return confirmNewPassword;
    }

    public void setConfirmNewPassword(String confirmNewPassword) {
        this.confirmNewPassword = confirmNewPassword;
    }
}
