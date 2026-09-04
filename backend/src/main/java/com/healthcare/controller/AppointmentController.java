package com.healthcare.controller;

import com.healthcare.dto.AppointmentRequest;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.User;
import com.healthcare.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAppointments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getAppointments(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Appointment> create(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.create(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> update(@AuthenticationPrincipal User user,
                                              @PathVariable String id,
                                              @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.update(user.getId(), id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancel(@AuthenticationPrincipal User user, @PathVariable String id) {
        return ResponseEntity.ok(appointmentService.cancel(user.getId(), id));
    }
}
