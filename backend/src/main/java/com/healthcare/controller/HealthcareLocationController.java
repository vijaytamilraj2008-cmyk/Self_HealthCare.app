package com.healthcare.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/healthcare")
public class HealthcareLocationController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/nearby")
    public ResponseEntity<String> getNearbyHealthcare(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10000") int radius) {

        String overpassUrl = "https://overpass.kumi.systems/api/interpreter";

        String query =
                "[out:json][timeout:25];" +
                "(" +
                "node[amenity=hospital](around:" + radius + "," + latitude + "," + longitude + ");" +
                "way[amenity=hospital](around:" + radius + "," + latitude + "," + longitude + ");" +
                "relation[amenity=hospital](around:" + radius + "," + latitude + "," + longitude + ");" +
                "node[amenity=clinic](around:" + radius + "," + latitude + "," + longitude + ");" +
                "way[amenity=clinic](around:" + radius + "," + latitude + "," + longitude + ");" +
                "node[amenity=doctors](around:" + radius + "," + latitude + "," + longitude + ");" +
                "way[amenity=doctors](around:" + radius + "," + latitude + "," + longitude + ");" +
                ");" +
                "out center tags;";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("User-Agent", "Self-Healthcare-App/1.0");

        String body = "data=" +
                URLEncoder.encode(query, StandardCharsets.UTF_8);

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {

            System.out.println("========================================");
            System.out.println("Healthcare nearby request received");
            System.out.println("Latitude: " + latitude);
            System.out.println("Longitude: " + longitude);
            System.out.println("Radius: " + radius);
            System.out.println("Calling Overpass API...");
            System.out.println("========================================");

            ResponseEntity<String> response = restTemplate.postForEntity(
                    overpassUrl,
                    request,
                    String.class
            );

            System.out.println("Overpass response status: " + response.getStatusCode());
            System.out.println("Overpass response received successfully");

            return ResponseEntity
                    .status(response.getStatusCode())
                    .body(response.getBody());

        } catch (Exception e) {

            System.err.println("========================================");
            System.err.println("ERROR CALLING OVERPASS API");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");

            return ResponseEntity
                    .internalServerError()
                    .body("{\"error\":\"Unable to retrieve nearby healthcare facilities\",\"details\":\""
                            + escapeJson(e.getMessage())
                            + "\"}");
        }
    }

    private String escapeJson(String text) {

        if (text == null) {
            return "Unknown error";
        }

        return text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}