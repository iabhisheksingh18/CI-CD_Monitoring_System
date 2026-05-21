import api from './api';

const generateDemoResponse = (question: string, logContext?: string) => {
  const q = question.toLowerCase();

  // If logs are provided
  if (logContext || q.includes('log') || q.includes('this error')) {
    return `Based on the logs, I see a **TypeScript compilation error** in \`src/App.tsx\`.

**Root Cause:**
The \`useRouter\` hook is being used, but it's not imported correctly, and \`axios\` is missing from your dependencies.

**Auto-Fix Suggestion:**
Run the following commands to resolve this:
\`\`\`bash
npm install axios
\`\`\`
And ensure you import routing hooks from \`react-router-dom\` (like \`useNavigate\`) instead of \`useRouter\` which is for Next.js.`;
  }

  // Docker issues
  if (q.includes('docker') || q.includes('container')) {
    return `Docker build failures are often caused by missing dependencies or platform mismatches.

Try adding the platform flag to your \`docker build\` command if you are on Apple Silicon:
\`\`\`bash
docker build --platform linux/amd64 -t my-app .
\`\`\`
Or check if your \`Dockerfile\` is attempting to copy files that are excluded in your \`.dockerignore\`.`;
  }

  // General Build failures
  if (q.includes('build fail') || q.includes('pipeline fail') || q.includes('failing')) {
    return `I checked your recent pipeline runs. The most common cause for **Build & Deploy** failures in this project is NPM dependency resolution.

I recommend running a clean install before building:
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
npm run build
\`\`\`
Let me know if you want me to trigger a new CI run after you push these changes.`;
  }

  // Greeting / General
  return `I am your **AI DevOps Assistant**. 

I can help you with:
- Analyzing failing logs and suggesting fixes
- Explaining Docker or Kubernetes errors
- Providing auto-remediation scripts for common pipeline failures

Try asking: *"Why did my build fail?"* or *"Fix Docker issue"*`;
};

export const chatService = {
  sendMessage: async (question: string, logContext?: string) => {
    try {
      const body: any = { question };
      if (logContext) body.logContext = logContext;
      const response = await api.post('/chat', body);
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable — simulating AI Chatbot response');
      // Simulate network delay for AI "thinking"
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return { response: generateDemoResponse(question, logContext) };
    }
  }
};
