import api from './api';

// Demo mode state for projects isolated by user
const getDemoProjectsKey = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.username) return `demo_projects_${user.username}`;
    } catch (e) {}
  }
  return 'demo_projects_guest';
};

const getDemoProjects = () => {
  const key = getDemoProjectsKey();
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  return [];
};

const saveDemoProjects = (projects: any[]) => {
  const key = getDemoProjectsKey();
  localStorage.setItem(key, JSON.stringify(projects));
};

export const projectService = {
  getProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (err: any) {
      console.warn('Backend unavailable — using demo projects');
      return getDemoProjects();
    }
  },
  
  createProject: async (projectData: { name: string, repoUrl: string, owner: string }) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (err: any) {
      console.warn('Backend unavailable — creating demo project');
      const newProject = {
        ...projectData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      const currentProjects = getDemoProjects();
      saveDemoProjects([...currentProjects, newProject]);
      return newProject;
    }
  },

  deleteProject: async (id: string) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (err: any) {
      console.warn('Backend unavailable — deleting demo project');
      const currentProjects = getDemoProjects();
      saveDemoProjects(currentProjects.filter((p: any) => p.id !== id));
      return { success: true };
    }
  }
};
