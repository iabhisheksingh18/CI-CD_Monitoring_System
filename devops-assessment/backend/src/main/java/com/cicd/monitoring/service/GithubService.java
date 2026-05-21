package com.cicd.monitoring.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GithubService {

    @Value("${github.token:}")
    private String githubToken;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.valueOf("application/vnd.github.v3+json")));
        if (githubToken != null && !githubToken.isEmpty()) {
            headers.setBearerAuth(githubToken);
        }
        return headers;
    }

    private String[] extractOwnerAndRepo(String repoUrl) {
        String cleaned = repoUrl.replaceFirst("^(https?://)?(www\\.)?github\\.com/", "");
        if (cleaned.endsWith(".git")) {
            cleaned = cleaned.substring(0, cleaned.length() - 4);
        }
        String[] parts = cleaned.split("/");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid GitHub URL format");
        }
        return new String[]{parts[0], parts[1]};
    }

    public List<?> fetchLatestCommits(String repoUrl) {
        try {
            String[] repoDetails = extractOwnerAndRepo(repoUrl);
            String url = String.format("https://api.github.com/repos/%s/%s/commits", repoDetails[0], repoDetails[1]);

            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch commits: " + e.getMessage());
        }
    }

    public List<?> fetchWorkflowRuns(String repoUrl) {
        try {
            String[] repoDetails = extractOwnerAndRepo(repoUrl);
            String url = String.format("https://api.github.com/repos/%s/%s/actions/runs?per_page=10", repoDetails[0], repoDetails[1]);

            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            
            return (List<?>) response.getBody().get("workflow_runs");
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch workflow runs: " + e.getMessage());
        }
    }

    public List<?> fetchRunJobs(String repoUrl, Long runId) {
        try {
            String[] repoDetails = extractOwnerAndRepo(repoUrl);
            String url = String.format("https://api.github.com/repos/%s/%s/actions/runs/%d/jobs", repoDetails[0], repoDetails[1], runId);

            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            
            return (List<?>) response.getBody().get("jobs");
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch jobs for run: " + e.getMessage());
        }
    }

    public String fetchJobLogs(String repoUrl, Long jobId) {
        try {
            String[] repoDetails = extractOwnerAndRepo(repoUrl);
            String url = String.format("https://api.github.com/repos/%s/%s/actions/jobs/%d/logs", repoDetails[0], repoDetails[1], jobId);

            HttpEntity<String> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch job logs: " + e.getMessage());
        }
    }

    public String triggerActionWorkflow(String repoUrl, String workflowId, String ref) {
        if (githubToken == null || githubToken.isEmpty()) {
            throw new RuntimeException("GitHub Token is missing. Please add 'github.token=[YOUR_TOKEN]' to your backend/src/main/resources/application.properties file.");
        }
        try {
            String[] repoDetails = extractOwnerAndRepo(repoUrl);
            String url = String.format("https://api.github.com/repos/%s/%s/actions/workflows/%s/dispatches", 
                    repoDetails[0], repoDetails[1], workflowId);

            Map<String, String> body = Collections.singletonMap("ref", ref);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, createHeaders());

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return "Workflow triggered successfully with status: " + response.getStatusCode();
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("GitHub Actions API Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to trigger workflow: " + e.getMessage());
        }
    }
}
