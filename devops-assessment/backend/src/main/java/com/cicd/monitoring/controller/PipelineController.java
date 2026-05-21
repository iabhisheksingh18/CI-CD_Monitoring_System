package com.cicd.monitoring.controller;

import com.cicd.monitoring.model.PipelineRun;
import com.cicd.monitoring.service.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pipelines")
public class PipelineController {

    @Autowired
    private PipelineService pipelineService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PipelineRun>> getProjectHistory(@PathVariable String projectId) {
        return ResponseEntity.ok(pipelineService.getProjectHistory(projectId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<PipelineRun>> getRecentActivity() {
        return ResponseEntity.ok(pipelineService.getRecentActivity());
    }

    @GetMapping("/stats/{projectId}")
    public ResponseEntity<com.cicd.monitoring.payload.PipelineStatsResponse> getProjectStats(@PathVariable String projectId) {
        return ResponseEntity.ok(pipelineService.getProjectStats(projectId));
    }
}
