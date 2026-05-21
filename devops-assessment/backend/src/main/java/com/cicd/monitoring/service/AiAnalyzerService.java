package com.cicd.monitoring.service;

import com.cicd.monitoring.payload.AiAnalysisResponse;
import com.cicd.monitoring.payload.LogRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
public class AiAnalyzerService {

    @Value("${ai.service.url:http://fastapi-ai:8000/analyze-log}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiAnalyzerService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    public AiAnalysisResponse analyzeLog(String rawLog) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        LogRequest requestBody = new LogRequest();
        requestBody.setLogInput(rawLog);

        HttpEntity<LogRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<AiAnalysisResponse> response = restTemplate.postForEntity(
                    aiServiceUrl,
                    requestEntity,
                    AiAnalysisResponse.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("AI Service returned an empty response");
            }

            return response.getBody();

        } catch (ResourceAccessException e) {
            // Connection refused, timeout, DNS failure
            throw new RuntimeException("AI Service is unreachable at " + aiServiceUrl + ". Ensure the FastAPI container is running. Detail: " + e.getMessage());
        } catch (HttpClientErrorException e) {
            // 4xx errors from FastAPI
            throw new RuntimeException("AI Service rejected the request (HTTP " + e.getStatusCode() + "): " + e.getResponseBodyAsString());
        } catch (HttpServerErrorException e) {
            // 5xx errors from FastAPI
            throw new RuntimeException("AI Service internal error (HTTP " + e.getStatusCode() + "): " + e.getResponseBodyAsString());
        } catch (RuntimeException e) {
            throw e; // re-throw our own RuntimeExceptions
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error calling AI Service: " + e.getMessage());
        }
    }
}
