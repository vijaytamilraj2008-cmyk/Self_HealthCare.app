package com.healthcare.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/healthcare")
public class HealthcareLocationController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/nearby")
    public ResponseEntity<String> getNearbyHealthcare(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10000") int radius) {

        String overpassUrl = "https://overpass-api.de/api/interpreter";

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
                java.net.URLEncoder.encode(
                        query,
                        java.nio.charset.StandardCharsets.UTF_8
                );

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    overpassUrl,
                    request,
                    String.class
            );

            return ResponseEntity
                    .status(response.getStatusCode())
                    .body(response.getBody());

        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body("{\"error\":\"Unable to retrieve nearby healthcare facilities\"}");
        }
    }
}