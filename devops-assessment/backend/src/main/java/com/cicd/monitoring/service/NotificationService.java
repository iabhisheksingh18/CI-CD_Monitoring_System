package com.cicd.monitoring.service;

import com.cicd.monitoring.model.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final RestTemplate restTemplate;

    public NotificationService() {
        this.restTemplate = new RestTemplate();
    }

    public void dispatchFailureAlert(Project project, String aiAnalysis) {
        logger.info("Dispatching Smart Notifications for project: {}", project.getName());

        if (project.getSlackWebhookUrl() != null && !project.getSlackWebhookUrl().isEmpty()) {
            sendSlackAlert(project.getSlackWebhookUrl(), project.getName(), aiAnalysis);
        }
        
        if (project.getTeamsWebhookUrl() != null && !project.getTeamsWebhookUrl().isEmpty()) {
            sendTeamsAlert(project.getTeamsWebhookUrl(), project.getName(), aiAnalysis);
        }
        
        if (project.getAlertEmail() != null && !project.getAlertEmail().isEmpty()) {
            sendEmailAlert(project.getAlertEmail(), project.getName(), aiAnalysis);
        }
    }

    private void sendSlackAlert(String webhookUrl, String projectName, String aiAnalysis) {
        try {
            Map<String, Object> payload = new HashMap<>();
            String message = String.format("🚨 *Pipeline Failed: %s*\n\n*AI Diagnostics:*\n%s", projectName, aiAnalysis);
            payload.put("text", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Successfully sent Slack alert to webhook");
        } catch (Exception e) {
            logger.error("Failed to send Slack alert: {}", e.getMessage());
        }
    }

    private void sendTeamsAlert(String webhookUrl, String projectName, String aiAnalysis) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("@type", "MessageCard");
            payload.put("@context", "http://schema.org/extensions");
            payload.put("themeColor", "FF0000");
            payload.put("summary", "Pipeline Failure Alert");

            Map<String, Object> section = new HashMap<>();
            section.put("activityTitle", "🚨 Pipeline Failed: " + projectName);
            section.put("activitySubtitle", "AI DevOps Platform Alert");
            section.put("text", aiAnalysis);
            payload.put("sections", new Object[]{section});

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Successfully sent MS Teams alert to webhook");
        } catch (Exception e) {
            logger.error("Failed to send MS Teams alert: {}", e.getMessage());
        }
    }

    private void sendEmailAlert(String emailAddress, String projectName, String aiAnalysis) {
        // Simulating Email Dispatch for Demo environment to avoid SMTP setup
        logger.info("\n================= 📧 MOCK EMAIL DISPATCH =================\n" +
                "To: {}\n" +
                "Subject: CRITICAL: Pipeline Failure - {}\n" +
                "Body:\n" +
                "The pipeline for your project '{}' has failed.\n\n" +
                "AI Root Cause Analysis:\n{}\n" +
                "===========================================================\n", 
                emailAddress, projectName, projectName, aiAnalysis);
    }
}
