package com.cicd.monitoring.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PipelineStatsResponse {
    private long totalRuns;
    private long successCount;
    private long failureCount;
    private double failureRate;
}
