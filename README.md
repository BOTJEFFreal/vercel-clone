```markdown
This project replicates (in a simplified form) the workflow of popular hosting services like Vercel. It allows users to:

- Submit a GitHub repository URL
- Trigger a build process on AWS ECS/Fargate
- Upload built files to S3 bucket
- Serve files through custom subdomain-like URLs
- Track deployment status and logs

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Key Components](#3-key-components)
4. [Environment Variables](#4-environment-variables)
5. [System Workflow](#5-system-workflow)
6. [Getting Started](#6-getting-started)
7. [Customization](#7-customization)
8. [Troubleshooting](#8-troubleshooting)

## 1. Architecture Overview

### Component Diagram

```plaintext
+------------+          +-------------+          +---------------+
|  React     |          |  Express    |          |  AWS ECS      |
|  Frontend  | <------> |  API Server | <------> |  (Fargate)    |
+------------+          +-------------+          +---------------+
                              |                         |
                              |                         v
                              |                   +---------------+
                              |                   |  Build Server |
                              |                   |  (Docker)     |
                              |                   +---------------+
                              |                         |
                              v                         v
+------------+          +-------------+          +---------------+
|  Reverse   | <------+ |  MongoDB    | <------+ |  AWS S3       |
|  Proxy     |          |  Database   |          |  Bucket       |
+------------+          +-------------+          +---------------+
```

### Data Flow

1. User submits GitHub URL via React frontend
2. API Server creates MongoDB record and triggers ECS task
3. ECS runs Dockerized build server:
   - Clones repository
   - Installs dependencies
   - Builds project
   - Uploads artifacts to S3
4. Reverse proxy serves built files from S3 via subdomains
5. Status updates propagated back to MongoDB

## 2. Project Structure

```text
vercel-clone/
├── api-server/              # Core backend service
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── services/           # AWS integration
│   ├── server.js           # Server entry point
│   └── db.js               # Database connection
├── buildServer/            # Dockerized build environment
│   ├── Dockerfile          # Container definition
│   ├── main.sh             # Build entry script
│   └── src/                # Build logic
│       ├── controller/     # Build controllers
│       ├── models/         # Logging schemas
│       └── utils/          # Helper functions
├── frontend/               # React dashboard
│   ├── public/             # Static assets
│   └── src/                # UI components
│       ├── components/     # React components
│       └── App.jsx         # Main application
├── requestHandler/         # Reverse proxy
│   └── src/                # Proxy configuration
│       └── index.js        # Proxy server
├── getFiles.js             # Project structure generator
└── package.json            # Root dependencies
```

## 3. Key Components

### 3.1 API Server (`api-server/`)
**Purpose**: Manages deployments and coordinates services  
**Tech Stack**: Node.js, Express, Mongoose, AWS SDK

Key Files:
- `routes/project.js`: Deployment creation endpoints
- `services/ecs.js`: ECS task management
- `models/project.js`: Project schema definition

### 3.2 Build Server (`buildServer/`)
**Purpose**: Executes build process in isolated environment  
**Tech Stack**: Docker, Node.js, AWS S3 SDK

Key Files:
- `Dockerfile`: Container configuration
- `src/controller/buildController.js`: Build logic
- `src/utils/mongo.js`: Database connections

### 3.3 Frontend (`frontend/`)
**Purpose**: User interface for deployment management  
**Tech Stack**: React, Vite, Axios

Key Files:
- `src/components/EnterURL`: Deployment form
- `src/components/Dashboard`: Status monitoring
- `vite.config.js`: Build configuration

### 3.4 Reverse Proxy (`requestHandler/`)
**Purpose**: Routes requests to S3 artifacts  
**Tech Stack**: Node.js, http-proxy

Key Files:
- `src/index.js`: Proxy configuration
- `package.json`: Dependency management

## 4. Environment Variables

### API Server (`.env`)
```ini
PORT=9000
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/Projects
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLUSTER_ARN=arn:aws:ecs:region:account-id:cluster/cluster-name
TASK_ARN=arn:aws:ecs:region:account-id:task-definition/task-name:1
SUBNETS=subnet-xxx,subnet-yyy
SECURITY_GROUPS=sg-xxx
```

### Build Server (`.env`)
```ini
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/Logs
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### Reverse Proxy (`.env`)
```ini
AWS_S3_BUCKET=your-bucket-name
PORT=8000
```

## 5. System Workflow

### Detailed Sequence Flow

1. **User Submission**
   - Frontend sends POST to `/api/project`
   - Payload: `{ gitURL: "https://github.com/user/repo", userID: "unique-id" }`

2. **API Server Processing**
   - Creates MongoDB document with status "QUEUED"
   - Triggers ECS Fargate task with environment variables:
     ```json
     {
       "GIT_REPOSITORY_URL": "<repo-url>",
       "PROJECT_ID": "<generated-slug>",
       "USER_ID": "<user-id>"
     }
     ```

3. **Build Process**
   - Docker container clones repository
   - Executes build commands:
     ```bash
     npm install
     npm run build
     ```
   - Uploads `dist/` contents to S3 path: `output/<PROJECT_ID>/`

4. **Status Updates**
   - Build server updates MongoDB status:
     - "IN_PROGRESS" during build
     - "READY" on success
     - "FAILED" on errors

5. **File Serving**
   - User accesses `<PROJECT_SLUG>.localhost:8000`
   - Reverse proxy:
     - Extracts subdomain (PROJECT_SLUG)
     - Fetches `s3://<bucket>/output/<PROJECT_SLUG>/index.html`

## 6. Getting Started

### 6.1 Prerequisites
- Node.js v18+
- Docker Desktop
- AWS Account with:
  - ECS Cluster (Fargate)
  - S3 Bucket
  - IAM User with proper permissions
- MongoDB Atlas cluster

### 6.2 Local Setup
```bash
# Clone repository
git clone https://github.com/your-username/vercel-clone.git
cd vercel-clone

# Install dependencies
npm install
cd api-server && npm install
cd ../buildServer && npm install
cd ../frontend && npm install
cd ../requestHandler && npm install

# Start services (separate terminals)
# API Server
cd api-server && npm start

# Frontend
cd frontend && npm run dev

# Reverse Proxy
cd requestHandler && npm start
```

### 6.3 AWS Deployment
1. Build Docker image:
   ```bash
   cd buildServer
   docker build -t your-username/vercel-build .
   docker push your-username/vercel-build
   ```

2. Create ECS Task Definition:
   - Family: `vercel-build-task`
   - Container: `your-username/vercel-build`
   - Environment variables from API Server

3. Configure Security Groups:
   - Allow outbound S3 access
   - Enable SSH if debugging needed

## 7. Customization

### Build Process
Modify `buildServer/src/controller/buildController.js`:
```javascript
// Change build commands
const p = exec(`cd ${outDirPath} && yarn install && yarn build`);

// Customize S3 upload path
const command = new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: `custom-path/${PROJECT_ID}/${file}`
});
```

### Logging
Implement custom logging in `loggingController.js`:
```javascript
export const logging = async (message, error = false) => {
  // Add Slack/webhook integration
  if(error) sendToSlack(message);
  
  // Store in MongoDB
  await Logs.create({
    message,
    error,
    timestamp: new Date()
  });
};
```

## 8. Troubleshooting

### Common Issues

**ECS Task Failing**
```bash
# Check task logs
aws logs get-log-events \
  --log-group-name /ecs/vercel-build \
  --log-stream-name ecs/vercel-build/XXXXXX
```

**S3 Upload Errors**
- Verify IAM policy has `s3:PutObject` permission
- Check bucket CORS configuration:
  ```xml
  <CORSConfiguration>
    <CORSRule>
      <AllowedOrigin>*</AllowedOrigin>
      <AllowedMethod>GET</AllowedMethod>
      <MaxAgeSeconds>3000</MaxAgeSeconds>
    </CORSRule>
  </CORSConfiguration>
  ```

**MongoDB Connection Issues**
```javascript
// Test connection
mongoose.connect(DB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));
```

