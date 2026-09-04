package com.healthcare.controller;

import com.healthcare.dto.MedicalDocumentRequest;
import com.healthcare.entity.User;
import com.healthcare.service.MedicalDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class MedicalDocumentController {
    private final MedicalDocumentService service;
    public MedicalDocumentController(MedicalDocumentService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<MedicalDocumentService.MedicalDocumentResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getDocuments(user.getId()));
    }

    @PostMapping
    public ResponseEntity<MedicalDocumentService.MedicalDocumentResponse> save(@AuthenticationPrincipal User user, @RequestBody MedicalDocumentRequest request) {
        return ResponseEntity.ok(service.save(user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable String id) {
        service.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
