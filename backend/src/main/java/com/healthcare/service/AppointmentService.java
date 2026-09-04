package com.healthcare.service;

import com.healthcare.dto.AppointmentRequest;
import com.healthcare.entity.Appointment;
import com.healthcare.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {
    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public List<Appointment> getAppointments(String userId) {
        return repository.findByUserIdOrderByDateAscTimeAsc(userId);
    }

    @Transactional
    public Appointment create(String userId, AppointmentRequest request) {
        validateDate(request.getDate());
        validateTime(request.getTime());
        Appointment appointment = new Appointment();
        appointment.setId("apt_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6));
        appointment.setUserId(userId);
        appointment.setHospitalId(request.getHospitalId());
        appointment.setHospitalName(request.getHospitalName().trim());
        appointment.setDoctorName(request.getDoctorName().trim());
        appointment.setDepartment(request.getDepartment().trim());
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime().trim());
        appointment.setPurpose(request.getPurpose().trim());
        appointment.setNotes(request.getNotes() == null ? "" : request.getNotes().trim());
        appointment.setStatus("upcoming");
        appointment.setFee(request.getFee());
        return repository.save(appointment);
    }

    @Transactional
    public Appointment update(String userId, String id, AppointmentRequest request) {
        validateDate(request.getDate());
        validateTime(request.getTime());
        Appointment appointment = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found."));
        if (!"upcoming".equals(appointment.getStatus())) {
            throw new IllegalArgumentException("Only upcoming appointments can be edited.");
        }
        appointment.setHospitalId(request.getHospitalId());
        appointment.setHospitalName(request.getHospitalName().trim());
        appointment.setDoctorName(request.getDoctorName().trim());
        appointment.setDepartment(request.getDepartment().trim());
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime().trim());
        appointment.setPurpose(request.getPurpose().trim());
        appointment.setNotes(request.getNotes() == null ? "" : request.getNotes().trim());
        appointment.setFee(request.getFee());
        return repository.save(appointment);
    }

    @Transactional
    public Appointment cancel(String userId, String id) {
        Appointment appointment = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found."));
        if (!"upcoming".equals(appointment.getStatus())) {
            throw new IllegalArgumentException("Only upcoming appointments can be cancelled.");
        }
        appointment.setStatus("cancelled");
        return repository.save(appointment);
    }


    private void validateTime(String time) {
        if (time == null || !time.trim().matches("^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$")) {
            throw new IllegalArgumentException("Please enter time in the format HH:MM AM or HH:MM PM.");
        }
    }

    private void validateDate(String date) {
        try {
            LocalDate requested = LocalDate.parse(date);
            if (requested.isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Appointment date cannot be in the past.");
            }
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Please enter a valid appointment date.");
        }
    }
}
