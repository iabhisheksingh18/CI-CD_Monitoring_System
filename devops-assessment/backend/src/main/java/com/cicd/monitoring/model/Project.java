package com.cicd.monitoring.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;

@Document(collection = "projects")
public class Project {
    @Id
    private String id;

    @NotBlank
    private String name;

    @NotBlank
    private String repoUrl;

    private String owner;
    
    private String slackWebhookUrl;
    private String teamsWebhookUrl;
    private String alertEmail;

    public Project() {
    }

    public Project(String name, String repoUrl, String owner) {
        this.name = name;
        this.repoUrl = repoUrl;
        this.owner = owner;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRepoUrl() {
        return repoUrl;
    }

    public void setRepoUrl(String repoUrl) {
        this.repoUrl = repoUrl;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getSlackWebhookUrl() {
        return slackWebhookUrl;
    }

    public void setSlackWebhookUrl(String slackWebhookUrl) {
        this.slackWebhookUrl = slackWebhookUrl;
    }

    public String getTeamsWebhookUrl() {
        return teamsWebhookUrl;
    }

    public void setTeamsWebhookUrl(String teamsWebhookUrl) {
        this.teamsWebhookUrl = teamsWebhookUrl;
    }

    public String getAlertEmail() {
        return alertEmail;
    }

    public void setAlertEmail(String alertEmail) {
        this.alertEmail = alertEmail;
    }
}
