# JFrog Xray Demo Script - Block Download Feature

This demo shows how JFrog Xray can block downloads of vulnerable Docker images using the "Block Download" policy.

## Prerequisites
- JFrog Artifactory instance: https://trialh7v8xh.jfrog.io
- GitHub repository: r2rajan/jfrog-eks-demo
- EKS cluster: jfrog-demo-cluster (Dev environment)
- Watch policy configured with CVSS >= 7.0 threshold
- **Current image already has HIGH/CRITICAL vulnerabilities in npm and loadcrypto packages**

## Current Status
- Deployed image: `trialh7v8xh.jfrog.io/docker-dev-local/jfrog-demo-app:fa07cd5-1772999601`
- Known vulnerabilities: npm and loadcrypto packages have high/critical severity issues
- Image is in docker-dev-local but NOT promoted to docker-prod-local

---

## Part 1: Demonstrating Vulnerable Image Blocking

### Step 1: Verify Current Application State

Navigate to the project directory:
```bash
cd /workshop/jfrog
```

Check currently deployed image:
```bash
kubectl get deployment jfrog-demo-app -o jsonpath='{.spec.template.spec.containers[0].image}'
kubectl get pods -l app=jfrog-demo-app
```

**Current image**: `trialh7v8xh.jfrog.io/docker-dev-local/jfrog-demo-app:fa07cd5-1772999601`

### Step 2: View Current Package Dependencies

```bash
cat package.json
```

**Note**: The current dependencies include versions with known vulnerabilities in npm and loadcrypto packages.

### Step 3: View Xray Scan Results for Current Image

In JFrog UI:
1. Go to https://trialh7v8xh.jfrog.io
2. Navigate to **Application** → **Artifactory** → **Artifacts**
3. Browse to `docker-dev-local/jfrog-demo-app`
4. Click on the image tag `fa07cd5-1772999601` (or latest)
5. Go to **Xray Data** tab
6. **Point out the HIGH/CRITICAL vulnerabilities** in npm and loadcrypto packages
7. **Show the CVSS scores >= 7.0**

**Explain**: These vulnerabilities were detected by Xray scan. The image is currently in docker-dev-local and deployed to Dev environment, but it was NOT promoted to docker-prod-local because of the high CVSS scores.

### Step 4: Enable "Block Download" Policy

In JFrog UI:
1. Go to **Administration** → **Xray** → **Watches & Policies**
2. Click on your Watch (e.g., "jfrog-demo-watch")
3. Click on the Policy (e.g., "high-severity-policy")
4. Under **Rules**, find the rule with CVSS >= 7.0
5. Check **Block Download** checkbox
6. Click **Save**

**Explain**:
- This setting will prevent ANY download of artifacts that violate this policy
- It's different from "Fail Build" which only blocks promotion
- "Block Download" will even prevent pulling the image that's already in docker-dev-local

### Step 5: Test Docker Pull Manually (Optional)

```bash
# Try to pull the vulnerable image from JFrog
sudo docker login trialh7v8xh.jfrog.io

sudo docker pull trialh7v8xh.jfrog.io/docker-dev-local/jfrog-demo-app:fa07cd5-1772999601
```

**Expected outcome**:
```
Error response from daemon: pull access denied for trialh7v8xh.jfrog.io/docker-dev-local/jfrog-demo-app,
repository does not exist or may require 'docker login':
denied: DENIED: Artifact download request rejected due to download blocking policy
```

### Step 6: Force Kubernetes to Re-pull Image

To demonstrate the blocking in Kubernetes, restart the deployment:

```bash
# Restart deployment to force image re-pull
kubectl rollout restart deployment/jfrog-demo-app

# Watch pod status
kubectl get pods -l app=jfrog-demo-app -w
```

**Expected outcome**: New pods will show `ImagePullBackOff` or `ErrImagePull` status.

### Step 7: Check Pod Events for Blocking Error

```bash
# Get pod name
POD_NAME=$(kubectl get pods -l app=jfrog-demo-app --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')

# Describe pod to see events
kubectl describe pod $POD_NAME | grep -A 10 Events
```

**Expected outcome**: Pod events show:
```
Failed to pull image: DENIED: Artifact download request rejected due to download blocking policy
```

**Explain**: Even though the image exists in docker-dev-local and was previously running, Kubernetes cannot pull it now because Xray's "Block Download" policy prevents any download of this vulnerable artifact.

---

## Part 2: Fixing the Vulnerabilities

### Step 8: Remove "Block Download" Setting

In JFrog UI:
1. Go to **Administration** → **Xray** → **Watches & Policies**
2. Click on your Watch
3. Click on the Policy
4. Under **Rules**, find the rule with CVSS >= 7.0
5. Uncheck **Block Download** checkbox (keep "Fail Build" checked)
6. Click **Save**

**Explain**:
- Removing "Block Download" allows the image to be downloaded to Dev environment
- Keeping "Fail Build" still prevents promotion to production
- This allows testing and fixing vulnerable code in Dev while protecting Production
- This is the recommended configuration for most CI/CD pipelines

### Step 9: Restore Current Deployment (Optional)

If you restarted the deployment in Step 6:

```bash
# This will restore the running pods
kubectl rollout undo deployment/jfrog-demo-app
kubectl get pods -l app=jfrog-demo-app
```

### Step 10: Fix Vulnerable Dependencies

Update packages to secure versions:

```bash
cd /workshop/jfrog

# Update npm and other dependencies
npm update
npm audit fix

# Or manually update specific packages if needed
# Check what needs to be fixed:
npm audit
```

View the changes:
```bash
git diff package.json package-lock.json
```

### Step 11: Commit and Push Fix

```bash
git add package.json package-lock.json
git commit -m "Fix: Update npm and dependencies to resolve high/critical vulnerabilities"
git push origin main
```

### Step 12: Monitor Workflow Success

```bash
# Watch the workflow execution
gh run watch
```

Or visit: https://github.com/r2rajan/jfrog-eks-demo/actions

**Expected outcome**:
- Build and push to docker-dev-local succeeds
- Xray scan shows NO high/critical CVSS vulnerabilities (< 7.0)
- Image is promoted to docker-prod-local ✅
- Image deploys to Dev environment successfully
- JFrog webhook triggers production deployment

### Step 13: Verify Xray Scan Results

In JFrog UI:
1. Navigate to **Application** → **Artifactory** → **Artifacts**
2. Browse to `docker-dev-local/jfrog-demo-app`
3. Click on the **newest image tag**
4. Go to **Xray Data** tab
5. **Verify no vulnerabilities with CVSS >= 7.0**
6. **Show that npm and loadcrypto vulnerabilities are resolved**

**Expected outcome**: Clean scan - no high or critical severity vulnerabilities remain.

### Step 14: Verify Production Promotion

In JFrog UI:
1. Navigate to **Application** → **Artifactory** → **Artifacts**
2. Browse to `docker-prod-local/jfrog-demo-app`
3. **Verify the newest image tag exists** (promoted from dev)
4. Click on the image and check **Xray Data** tab
5. **Confirm it has a clean scan**

**Explain**: The image was automatically promoted from docker-dev-local to docker-prod-local because it passed the CVSS < 7.0 threshold.

### Step 15: Check Dev Deployment

```bash
# Get pod status
kubectl get pods -l app=jfrog-demo-app

# Get application URL
DEV_URL=$(kubectl get service jfrog-demo-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Dev URL: http://$DEV_URL"

# Test the application
curl http://$DEV_URL/health
```

**Expected outcome**:
- Pods are in `Running` status (using new secure image)
- Health check returns `{"status":"healthy"}`
- Application is running with fixed dependencies

### Step 16: Check Production Deployment (if webhook configured)

```bash
# Switch to production cluster context
aws eks update-kubeconfig --name jfrog-demo-cluster-prod --region us-east-1

# Get pod status
kubectl get pods -l app=jfrog-demo-app-prod

# Get application URL
PROD_URL=$(kubectl get service jfrog-demo-app-prod -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Production URL: http://$PROD_URL"

# Test the application
curl http://$PROD_URL/health
```

**Expected outcome**:
- Production deployment triggered automatically by JFrog webhook
- Pods running with secure image from docker-prod-local
- Application accessible and healthy

---

## Summary of Demo Flow

### Part 1: Demonstrating Block Download with Existing Vulnerabilities
1. ✅ Current image has HIGH/CRITICAL vulnerabilities (npm, loadcrypto packages)
2. ✅ Image deployed to Dev but NOT promoted to Production
3. ✅ View Xray scan showing CVSS >= 7.0 vulnerabilities in JFrog UI
4. ✅ Enable "Block Download" policy in Xray
5. ❌ Docker pull fails (download blocked by policy)
6. ❌ Kubernetes deployment restart causes ImagePullBackOff (cannot pull vulnerable image)
7. ✅ Demonstrates that "Block Download" prevents ALL downloads, even to Dev

### Part 2: Fixing and Deploying Secure Version
1. ✅ Remove "Block Download" policy (keep "Fail Build" for prod protection)
2. ✅ Restore Dev deployment if needed (rollback to running state)
3. ✅ Update npm and other dependencies to fix vulnerabilities
4. ✅ Commit and push fix to trigger CI/CD
5. ✅ Xray scan passes (no CVSS >= 7.0 vulnerabilities)
6. ✅ Image automatically promoted to docker-prod-local
7. ✅ Dev deployment successful with secure image
8. ✅ Production deployment triggered automatically via JFrog webhook

---

## Key Takeaways

1. **"Block Download" prevents ALL downloads**, not just promotion
   - Use with caution as it blocks even Dev environment deployments
   - Useful for completely preventing use of vulnerable artifacts

2. **"Fail Build" is better for most CI/CD scenarios**
   - Blocks promotion to production
   - Still allows deployment to Dev/Test for debugging
   - Provides flexibility while maintaining security

3. **CVSS >= 7.0 threshold** catches high and critical vulnerabilities
   - Aligns with industry best practices
   - Can be adjusted based on organization's risk tolerance

4. **Two-repository strategy** (dev/prod) enables:
   - Testing in Dev even with known vulnerabilities
   - Gated promotion to Production only for secure artifacts
   - Clear separation of environments

5. **Automated scanning in CI/CD** provides:
   - Early detection of vulnerabilities
   - Automated enforcement of security policies
   - Audit trail of security decisions
