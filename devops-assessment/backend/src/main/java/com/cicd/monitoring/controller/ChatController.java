package com.cicd.monitoring.controller;

import com.cicd.monitoring.payload.MessageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Value("${ai.service.url:http://fastapi-ai:8000/analyze-log}")
    private String aiServiceBaseUrl;

    private final RestTemplate restTemplate;

    public ChatController(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(60))  // LLM responses can be slow
                .build();
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        try {
            // Derive /chat URL from the configured base URL
            String chatUrl = aiServiceBaseUrl.replace("/analyze-log", "/chat");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(chatUrl, entity, Map.class);
            return ResponseEntity.ok(response.getBody());

        } catch (ResourceAccessException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new MessageResponse("AI Chat service is unreachable. Ensure the FastAPI container is running."));
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new MessageResponse("Chat request rejected: " + e.getResponseBodyAsString()));
        } catch (HttpServerErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new MessageResponse("AI Chat service error: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Chat service error: " + e.getMessage()));
        }
    }
}
