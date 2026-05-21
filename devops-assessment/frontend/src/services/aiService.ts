import api from './api';

// --- Demo Mock Data ---
const MOCK_RUNS = [
  { id: 1, name: 'Build & Deploy', run_number: 42, status: 'completed', conclusion: 'success', created_at: new Date().toISOString() },
  { id: 2, name: 'Integration Tests', run_number: 41, status: 'completed', conclusion: 'failure', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, name: 'Lint & Format', run_number: 40, status: 'completed', conclusion: 'success', created_at: new Date(Date.now() - 172800000).toISOString() }
];

const MOCK_LOGS = `> frontend@0.0.0 build
> tsc && vite build

src/App.tsx(14,5): error TS2304: Cannot find name 'useRouter'.
src/services/api.ts(2,23): error TS2307: Cannot find module 'axios' or its corresponding type declarations.

Error: Process completed with exit code 2.`;

const MOCK_AI_ANALYSIS = {
  status: 'failure',
  errorType: 'Build Compilation Error',
  rootCause: 'TypeScript is failing to compile because the `useRouter` hook is imported or used incorrectly (likely missing from react-router-dom) and the `axios` dependency is not installed in node_modules.',
  suggestion: 'Install the missing dependencies by running npm install axios and ensure useRouter is correctly imported from next/router or use useNavigate for react-router-dom.'
};

export const aiService = {
  analyzeLog: async (logInput: string, projectId?: string) => {
    try {
      const response = await api.post('/analyze-log', { logInput, projectId });
      return response.data;
    } catch (err: any) {
      console.warn('Backend unavailable — returning demo AI analysis');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI delay
      
      // Save to mock history
      if (projectId) {
        const history = JSON.parse(localStorage.getItem(`history_${projectId}`) || '[]');
        history.unshift({ ...MOCK_AI_ANALYSIS, id: Date.now(), timestamp: new Date().toISOString(), logContent: logInput });
        localStorage.setItem(`history_${projectId}`, JSON.stringify(history));
      }
      
      return MOCK_AI_ANALYSIS;
    }
  },
  
  getProjectHistory: async (projectId: string) => {
    try {
      const response = await api.get(`/pipelines/project/${projectId}`);
      return response.data;
    } catch (err: any) {
      return JSON.parse(localStorage.getItem(`history_${projectId}`) || '[]');
    }
  },
  
  getStats: async (projectId: string) => {
    try {
      const response = await api.get(`/pipelines/stats/${projectId}`);
      return response.data;
    } catch (err: any) {
      return { totalRuns: 124, successCount: 112, failureCount: 12, failureRate: 9.6 };
    }
  },
  
  triggerPipeline: async (repoUrl: string, workflowId: string) => {
    try {
      const response = await api.post('/github/trigger', { repoUrl, workflowId, ref: 'main' });
      return response.data;
    } catch (err: any) {
      console.warn('Backend unavailable — simulating pipeline trigger');
      return { message: 'Workflow triggered successfully in demo mode' };
    }
  },

  fetchWorkflowRuns: async (repoUrl: string) => {
    try {
      const response = await api.get(`/github/runs?repoUrl=${encodeURIComponent(repoUrl)}`);
      return response.data;
    } catch (err: any) {
      return MOCK_RUNS;
    }
  },

  fetchRunJobs: async (repoUrl: string, runId: number) => {
    try {
      const response = await api.get(`/github/jobs/${runId}?repoUrl=${encodeURIComponent(repoUrl)}`);
      return response.data;
    } catch (err: any) {
      return [{ id: 101, name: 'build', status: 'completed', conclusion: runId === 2 ? 'failure' : 'success' }];
    }
  },

  fetchJobLogs: async (repoUrl: string, jobId: number) => {
    try {
      const response = await api.get(`/github/logs/${jobId}?repoUrl=${encodeURIComponent(repoUrl)}`);
      return response.data;
    } catch (err: any) {
      return MOCK_LOGS;
    }
  }
};
