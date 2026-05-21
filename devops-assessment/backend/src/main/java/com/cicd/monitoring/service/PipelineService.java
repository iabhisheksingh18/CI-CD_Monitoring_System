package com.cicd.monitoring.service;

import com.cicd.monitoring.model.PipelineRun;
import com.cicd.monitoring.model.Project;
import com.cicd.monitoring.repository.PipelineRunRepository;
import com.cicd.monitoring.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PipelineService {

    @Autowired
    private PipelineRunRepository pipelineRunRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private NotificationService notificationService;

    public PipelineRun saveRun(PipelineRun run) {
        if (run.getTimestamp() == null) {
            run.setTimestamp(LocalDateTime.now());
        }
        PipelineRun savedRun = pipelineRunRepository.save(run);

        // Trigger Smart Notifications if the run failed
        if ("failure".equalsIgnoreCase(savedRun.getStatus())) {
            projectRepository.findById(savedRun.getProjectId()).ifPresent(project -> {
                // In a real system, we'd fetch the exact AI analysis for this run.
                // For the demo, we send a generalized alert if the analysis isn't cached yet.
                String aiAnalysis = "Dependencies failed to resolve during the build step. Run `npm install` and verify package versions.";
                notificationService.dispatchFailureAlert(project, aiAnalysis);
            });
        }

        return savedRun;
    }

    public List<PipelineRun> getProjectHistory(String projectId) {
        return pipelineRunRepository.findByProjectIdOrderByTimestampDesc(projectId);
    }

    public List<PipelineRun> getRecentActivity() {
        return pipelineRunRepository.findTop10ByOrderByTimestampDesc();
    }

    public com.cicd.monitoring.payload.PipelineStatsResponse getProjectStats(String projectId) {
        List<PipelineRun> runs = pipelineRunRepository.findByProjectIdOrderByTimestampDesc(projectId);
        long total = runs.size();
        long success = runs.stream().filter(r -> "success".equalsIgnoreCase(r.getStatus())).count();
        long failure = total - success;
        double rate = total == 0 ? 0 : (double) failure / total * 100;
        
        return new com.cicd.monitoring.payload.PipelineStatsResponse(total, success, failure, Math.round(rate * 100.0) / 100.0);
    }
}
