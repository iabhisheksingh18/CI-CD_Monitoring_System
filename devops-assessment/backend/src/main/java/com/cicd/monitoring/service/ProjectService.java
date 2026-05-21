package com.cicd.monitoring.service;

import com.cicd.monitoring.model.Project;
import com.cicd.monitoring.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByOwner(String owner) {
        return projectRepository.findByOwner(owner);
    }

    public void deleteProject(String id) {
        projectRepository.deleteById(id);
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }
}
