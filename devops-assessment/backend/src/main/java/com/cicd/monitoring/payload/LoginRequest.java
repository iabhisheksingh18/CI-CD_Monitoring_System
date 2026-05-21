package com.cicd.monitoring.payload;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
