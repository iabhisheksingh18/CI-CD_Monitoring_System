package com.cicd.monitoring.repository;

import com.cicd.monitoring.model.PipelineRun;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipelineRunRepository extends MongoRepository<PipelineRun, String> {
    List<PipelineRun> findByProjectIdOrderByTimestampDesc(String projectId);
    List<PipelineRun> findTop10ByOrderByTimestampDesc();
}
