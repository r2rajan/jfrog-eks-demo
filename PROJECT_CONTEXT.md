# JFrog-EKS Demo Project Context

## Project Overview
GitHub + JFrog Artifactory + AWS EKS integration demo with Xray security scanning.

## Key Infrastructure

### AWS Account
- **Account ID**: 418295681105
- **Region**: us-east-1
- **IAM User**: github-actions-jfrog-demo

### EKS Clusters
- **Dev Cluster**: jfrog-demo-cluster
- **Prod Cluster**: jfrog-demo-cluster-prod

### JFrog Artifactory
- **Instance URL**: https://trialh7v8xh.jfrog.io
- **Registry**: trialh7v8xh.jfrog.io
- **Username**: github-actions-token
- **Repositories**:
  - docker-dev-local (development images)
  - docker-prod-local (production images, promoted only if CVSS < 7.0)

### GitHub
- **Repository**: r2rajan/jfrog-eks-demo
- **Owner**: r2rajan
- **Main Branch**: main

## Application Details
- **Name**: jfrog-demo-app
- **Type**: Node.js Express application
- **Port**: 3000
- **Current Image**: trialh7v8xh.jfrog.io/docker-dev-local/jfrog-demo-app:fa07cd5-1772999601

## Current Status

### Phase 1 - COMPLETED ✅
- Node.js application with Express
- Dockerfile created
- Kubernetes manifests (deployment.yaml, service.yaml)
- GitHub Actions workflow for dev deployment
- Dev EKS cluster provisioned
- Application successfully deployed to Dev

### Phase 2 - COMPLETED ✅
- Production EKS cluster provisioned
- JFrog repositories created (docker-dev-local, docker-prod-local)
- Xray policies configured (CVSS >= 7.0 threshold)
- GitHub Actions workflows:
  - phase2-dev-deploy.yaml (build, scan, deploy to dev, promote if clean)
  - phase2-prod-deploy.yaml (deploy to prod via webhook)
- **Critical Fix**: Added imagePullSecrets to deployment.yaml
- Application successfully pulling from JFrog and running

### Known Issues & Resolutions
1. **JFrog CLI Command**: Use `jf` not `jfrog` (executable renamed)
2. **Authentication**: Username is `github-actions-token` (token identity, not email)
3. **Xray Block Download**: Blocks ALL downloads, too restrictive for dev. Removed, using "Fail Build" instead.
4. **ImagePullBackOff**: Fixed by adding `imagePullSecrets: [name: jfrog-secret]` to deployment.yaml

## Current Vulnerabilities
- **npm package**: HIGH/CRITICAL severity vulnerabilities
- **loadcrypto package**: HIGH/CRITICAL severity vulnerabilities
- **CVSS Score**: >= 7.0 (blocks production promotion)
- **Status**: Image in docker-dev-local, NOT promoted to docker-prod-local

## Workflows

### Dev Deployment Flow
1. Push to main branch
2. Build Docker image
3. Push to docker-dev-local
4. Scan with Xray
5. Deploy to Dev EKS (always, even with vulnerabilities)
6. IF CVSS < 7.0: Promote to docker-prod-local
7. IF promoted: JFrog webhook triggers production deployment

### Production Deployment Flow
1. Triggered by JFrog webhook (repository_dispatch)
2. Or manual workflow_dispatch with image tag
3. Pulls from docker-prod-local
4. Deploys to Prod EKS cluster

## Key Files
- `/workshop/jfrog/claude.md` - Complete project documentation
- `/workshop/jfrog/DEMO_SCRIPT.md` - Screen recording demo script
- `/workshop/jfrog/package.json` - Node.js dependencies
- `/workshop/jfrog/server.js` - Express application
- `/workshop/jfrog/Dockerfile` - Container image definition
- `/workshop/jfrog/k8s/deployment.yaml` - Dev Kubernetes deployment
- `/workshop/jfrog/k8s/deployment-prod.yaml` - Prod Kubernetes deployment
- `/workshop/jfrog/k8s/service.yaml` - Dev Kubernetes service
- `/workshop/jfrog/k8s/service-prod.yaml` - Prod Kubernetes service
- `/workshop/jfrog/.github/workflows/phase2-dev-deploy.yaml` - Dev CI/CD
- `/workshop/jfrog/.github/workflows/phase2-prod-deploy.yaml` - Prod deployment

## GitHub Secrets Configured
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- JFROG_ACCESS_TOKEN
- JFROG_USERNAME (github-actions-token)
- JFROG_PASSWORD

## Important Commands

### Check Deployments
```bash
# Dev cluster
kubectl get pods -l app=jfrog-demo-app
kubectl get service jfrog-demo-app

# Prod cluster
aws eks update-kubeconfig --name jfrog-demo-cluster-prod --region us-east-1
kubectl get pods -l app=jfrog-demo-app-prod
kubectl get service jfrog-demo-app-prod
```

### Check Vulnerabilities
```bash
# View in JFrog UI
# https://trialh7v8xh.jfrog.io -> Artifactory -> Artifacts -> docker-dev-local/jfrog-demo-app

# Or use npm audit
cd /workshop/jfrog
npm audit
```

### Fix Vulnerabilities
```bash
npm audit fix
# Or: npm update
```

## Next Steps
1. Record demo showing Block Download feature
2. Fix npm and loadcrypto vulnerabilities
3. Test complete end-to-end flow with clean scan
4. Verify webhook-triggered production deployment

## Demo Script
See `/workshop/jfrog/DEMO_SCRIPT.md` for step-by-step screen recording guide.
