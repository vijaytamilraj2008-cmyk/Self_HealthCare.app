package com.healthcare.service;

import com.healthcare.dto.*;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String cleanMobile(String mobile) {
        if (mobile == null) return "";
        return mobile.replaceAll("\\D", "");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanMobile = cleanMobile(request.getMobile());

        if (cleanMobile.length() < 10) {
            throw new IllegalArgumentException("Please enter a valid 10-digit mobile number.");
        }

        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        if (userRepository.existsByMobile(cleanMobile)) {
            throw new IllegalArgumentException("An account with this mobile number already exists. Please log in.");
        }

        String userId = "usr_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 5);
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setId(userId);
        user.setMobile(cleanMobile);
        user.setUsername(request.getUsername().trim());
        user.setPassword(encodedPassword);
        user.setLocation(request.getLocation() != null ? request.getLocation().trim() : "");
        user.setEmergencyContactName(request.getEmergencyContactName() != null ? request.getEmergencyContactName().trim() : "");
        user.setEmergencyContactNumber(request.getEmergencyContactNumber() != null ? request.getEmergencyContactNumber().trim() : "");
        user.setAge(request.getAge());
        user.setGender(request.getGender() != null ? request.getGender() : "Male");
        user.setBloodGroup(request.getBloodGroup() != null ? request.getBloodGroup() : "O+");
        user.setAllergies(request.getAllergies() != null ? request.getAllergies().trim() : "");
        user.setExistingConditions(request.getExistingConditions() != null ? request.getExistingConditions().trim() : "");
        user.setCurrentMedications(request.getCurrentMedications() != null ? request.getCurrentMedications().trim() : "");
        user.setCreatedAt(Instant.now().toString());
        user.setUpdatedAt(Instant.now().toString());

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getMobile(), savedUser.getUsername());

        return AuthResponse.success(token, UserDto.fromEntity(savedUser), "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        String cleanMobile = cleanMobile(request.getMobile());

        User user = userRepository.findByMobile(cleanMobile)
                .orElseThrow(() -> new BadCredentialsException("No account found with this mobile number."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect password. Please try again.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getMobile(), user.getUsername());
        return AuthResponse.success(token, UserDto.fromEntity(user), "Login successful");
    }

    @Transactional
    public void resetPassword(ForgotPasswordRequest request) {
        String cleanMobile = cleanMobile(request.getMobile());
        String cleanEmergency = cleanMobile(request.getEmergencyContactNumber());

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        if (request.getConfirmNewPassword() != null && !request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalArgumentException("New passwords do not match.");
        }

        User user = userRepository.findByMobile(cleanMobile)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with this mobile number."));

        String userEmergencyClean = cleanMobile(user.getEmergencyContactNumber());

        if (userEmergencyClean.isEmpty() ||
            (!userEmergencyClean.contains(cleanEmergency) && !cleanEmergency.contains(userEmergencyClean))) {
            throw new IllegalArgumentException("Emergency contact number verification failed. Please check your registered details.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now().toString());
        userRepository.save(user);
    }

    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user.setUsername(request.getUsername().trim());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation().trim());
        }
        if (request.getEmergencyContactName() != null) {
            user.setEmergencyContactName(request.getEmergencyContactName().trim());
        }
        if (request.getEmergencyContactNumber() != null) {
            user.setEmergencyContactNumber(request.getEmergencyContactNumber().trim());
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(request.getBloodGroup());
        }
        if (request.getAllergies() != null) {
            user.setAllergies(request.getAllergies().trim());
        }
        if (request.getExistingConditions() != null) {
            user.setExistingConditions(request.getExistingConditions().trim());
        }
        if (request.getCurrentMedications() != null) {
            user.setCurrentMedications(request.getCurrentMedications().trim());
        }
        user.setUpdatedAt(Instant.now().toString());

        User updatedUser = userRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }
}
