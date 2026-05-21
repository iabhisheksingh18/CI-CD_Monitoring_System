package com.cicd.monitoring.payload;

import lombok.Data;

@Data
public class LogRequest {
    private String logInput;
    private String projectId;
}
