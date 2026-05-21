package com.cicd.monitoring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pipeline_runs")
public class PipelineRun {
    @Id
    private String id;
    private String projectId;
    private LocalDateTime timestamp;
    private String status;
    private String logContent;
    
    // AI Analysis results
    private String errorType;
    private String rootCause;
    private String suggestion;
}
