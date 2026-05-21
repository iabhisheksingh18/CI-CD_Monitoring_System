package com.cicd.monitoring.controller;

import com.cicd.monitoring.payload.MessageResponse;
import com.cicd.monitoring.service.GithubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    @Autowired
    private GithubService githubService;

    @GetMapping("/commits")
    public ResponseEntity<?> getCommits(@RequestParam String repoUrl) {
        try {
            return ResponseEntity.ok(githubService.fetchLatestCommits(repoUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/runs")
    public ResponseEntity<?> getWorkflowRuns(@RequestParam String repoUrl) {
        try {
            return ResponseEntity.ok(githubService.fetchWorkflowRuns(repoUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/jobs/{runId}")
    public ResponseEntity<?> getRunJobs(@RequestParam String repoUrl, @PathVariable Long runId) {
        try {
            return ResponseEntity.ok(githubService.fetchRunJobs(repoUrl, runId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/logs/{jobId}")
    public ResponseEntity<?> getJobLogs(@RequestParam String repoUrl, @PathVariable Long jobId) {
        try {
            return ResponseEntity.ok(githubService.fetchJobLogs(repoUrl, jobId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerWorkflow(@RequestBody Map<String, String> request) {
        try {
            String repoUrl = request.get("repoUrl");
            String workflowId = request.get("workflowId"); // e.g., "ci-cd.yml" or ID
            String ref = request.getOrDefault("ref", "main");

            String result = githubService.triggerActionWorkflow(repoUrl, workflowId, ref);
            return ResponseEntity.ok(new MessageResponse(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
