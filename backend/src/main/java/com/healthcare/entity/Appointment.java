package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appointment_user", columnList = "user_id"),
    @Index(name = "idx_appointment_date", columnList = "appointment_date")
})
public class Appointment {

    @Id
    @Column(length = 64, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "hospital_id", nullable = false, length = 128)
    private String hospitalId;

    @Column(name = "hospital_name", nullable = false, length = 255)
    private String hospitalName;

    @Column(name = "doctor_name", nullable = false, length = 255)
    private String doctorName;

    @Column(nullable = false, length = 120)
    private String department;

    @Column(name = "appointment_date", nullable = false, length = 10)
    private String date;

    @Column(name = "appointment_time", nullable = false, length = 20)
    private String time;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private double fee;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public Appointment() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getFee() { return fee; }
    public void setFee(double fee) { this.fee = fee; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
