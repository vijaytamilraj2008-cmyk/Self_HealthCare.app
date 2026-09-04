package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppointmentRequest {
    @NotBlank private String hospitalId;
    @NotBlank private String hospitalName;
    @NotBlank private String doctorName;
    @NotBlank private String department;
    @NotBlank private String date;
    @NotBlank private String time;
    @NotBlank private String purpose;
    private String notes;
    @NotNull private Double fee;

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String v) { hospitalId = v; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String v) { hospitalName = v; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String v) { doctorName = v; }
    public String getDepartment() { return department; }
    public void setDepartment(String v) { department = v; }
    public String getDate() { return date; }
    public void setDate(String v) { date = v; }
    public String getTime() { return time; }
    public void setTime(String v) { time = v; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String v) { purpose = v; }
    public String getNotes() { return notes; }
    public void setNotes(String v) { notes = v; }
    public Double getFee() { return fee; }
    public void setFee(Double v) { fee = v; }
}
