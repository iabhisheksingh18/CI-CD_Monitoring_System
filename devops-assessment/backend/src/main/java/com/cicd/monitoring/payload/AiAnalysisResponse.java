package com.cicd.monitoring.payload;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {
    private String status;
    private String errorType;
    private String rootCause;
    private String suggestion;
}
