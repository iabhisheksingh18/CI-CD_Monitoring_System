package com.cicd.monitoring.controller;

import com.cicd.monitoring.payload.AiAnalysisResponse;
import com.cicd.monitoring.payload.LogRequest;
import com.cicd.monitoring.payload.MessageResponse;
import com.cicd.monitoring.service.AiAnalyzerService;
import com.cicd.monitoring.service.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyze-log")
public class AiAnalyzerController {

    @Autowired
    private AiAnalyzerService aiAnalyzerService;

    @Autowired
    private PipelineService pipelineService;

    @PostMapping
    public ResponseEntity<?> analyzePipelineLog(@RequestBody LogRequest logRequest) {
        if (logRequest.getLogInput() == null || logRequest.getLogInput().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Log input cannot be empty"));
        }

        try {
            AiAnalysisResponse aiResponse = aiAnalyzerService.analyzeLog(logRequest.getLogInput());
            
            // If projectId is provided, save this as a PipelineRun
            if (logRequest.getProjectId() != null && !logRequest.getProjectId().isEmpty()) {
                com.cicd.monitoring.model.PipelineRun run = new com.cicd.monitoring.model.PipelineRun();
                run.setProjectId(logRequest.getProjectId());
                run.setLogContent(logRequest.getLogInput());
                run.setStatus(aiResponse.getStatus());
                run.setErrorType(aiResponse.getErrorType());
                run.setRootCause(aiResponse.getRootCause());
                run.setSuggestion(aiResponse.getSuggestion());
                
                pipelineService.saveRun(run);
            }

            return ResponseEntity.ok(aiResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
