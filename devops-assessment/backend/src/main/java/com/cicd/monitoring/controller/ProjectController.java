package com.cicd.monitoring.controller;

import com.cicd.monitoring.model.Project;
import com.cicd.monitoring.payload.MessageResponse;
import com.cicd.monitoring.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Project project) {
        // Ensure owner is set to current user if not provided or to prevent spoofing
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        project.setOwner(username);
        
        Project savedProject = projectService.createProject(project);
        return ResponseEntity.ok(savedProject);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getMyProjects() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        
        return ResponseEntity.ok(projectService.getProjectsByOwner(username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();

        return projectService.getProjectById(id)
                .map(project -> {
                    if (!project.getOwner().equals(username)) {
                        return ResponseEntity.status(403).body(new MessageResponse("Error: You do not own this project"));
                    }
                    projectService.deleteProject(id);
                    return ResponseEntity.ok(new MessageResponse("Project removed successfully"));
                })
                .orElse(ResponseEntity.badRequest().body(new MessageResponse("Error: Project not found")));
    }
}
