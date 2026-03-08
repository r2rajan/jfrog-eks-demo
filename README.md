# JFrog-EKS Demo Application

A demonstration of CI/CD pipeline integration between GitHub Actions, JFrog Artifactory with Xray, and AWS EKS.

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

3. Visit http://localhost:3000

### Docker Build

```bash
docker build -t jfrog-demo-app:latest .
docker run -p 3000:3000 jfrog-demo-app:latest
```

## Project Structure

```
.
├── server.js                 # Express application
├── package.json              # Node.js dependencies
├── Dockerfile               # Container image definition
├── k8s/                     # Kubernetes manifests
│   ├── deployment.yaml
│   └── service.yaml
└── .github/
    └── workflows/
        └── phase1-deploy.yaml  # GitHub Actions workflow
```

## Documentation

See `claude.md` for detailed setup and deployment instructions.
