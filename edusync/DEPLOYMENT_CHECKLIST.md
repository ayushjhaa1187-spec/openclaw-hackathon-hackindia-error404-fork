# 🚀 SESSION 21: PRODUCTION DEPLOYMENT CHECKLIST

## PRE-DEPLOYMENT (Local Machine)

- [ ] AWS Account created
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Docker installed and running
- [ ] Repository cloned locally
- [ ] All Dockerfiles created (API, Web, Admin)
- [ ] All scripts created in `scripts/infra/`

## DOCKER BUILD & TEST

- [ ] Docker images build successfully
  ```bash
  docker build -t edusync-api:latest packages/api/
  docker build -t edusync-web:latest apps/web/
  docker build -t edusync-admin:latest apps/admin/
  ```
- [ ] Images under 250MB each
- [ ] Health checks pass locally
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  curl http://localhost:3001/api/v1/health
  ```

## AWS INFRASTRUCTURE DEPLOYMENT

- [ ] VPC setup complete
  ```bash
  ./scripts/infra/setup-vpc.sh
  source vpc-config.env
  ```
- [ ] ECR repositories created
  ```bash
  ./scripts/infra/setup-ecr.sh
  ```
- [ ] Databases provisioned (wait 10-15 min)
  ```bash
  ./scripts/infra/setup-databases.sh
  ```
- [ ] ECS Cluster created
  ```bash
  ./scripts/infra/setup-ecs-cluster.sh
  ```
- [ ] ALB created with target groups
  ```bash
  ./scripts/infra/setup-alb.sh
  ```
- [ ] Task definitions registered
  ```bash
  aws ecs register-task-definition --cli-input-json file://deployment/ecs-task-api.json
  aws ecs register-task-definition --cli-input-json file://deployment/ecs-task-web.json
  aws ecs register-task-definition --cli-input-json file://deployment/ecs-task-admin.json
  ```
- [ ] Secrets stored in AWS Secrets Manager
  ```bash
  ./scripts/infra/setup-secrets.sh
  ```
- [ ] ECS Services created with auto-scaling
  ```bash
  ./scripts/infra/create-services.sh
  ```

## VERIFICATION

- [ ] All services running (desired count = running count)
  ```bash
  ./scripts/infra/verify-deployment.sh
  ```
- [ ] ALB DNS responds to requests
  - [ ] API: `curl http://$ALB_DNS/api/v1/health`
  - [ ] Web: `curl http://$ALB_DNS/`
  - [ ] Admin: `curl http://$ALB_DNS/admin/`
- [ ] CloudWatch logs visible
  ```bash
  aws logs tail /ecs/edusync-prod --follow
  ```
- [ ] Auto-scaling policies active
  ```bash
  aws application-autoscaling describe-scaling-activities \
    --service-namespace ecs --region us-east-1
  ```

## GITHUB ACTIONS SETUP

- [ ] GitHub secrets configured
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] GitHub workflow file exists (`.github/workflows/deploy-prod.yml`)
- [ ] Test deployment via push to main branch

## DOMAIN & DNS CONFIGURATION

- [ ] Domain registered
- [ ] Route 53 hosted zone created (optional)
- [ ] DNS records pointing to ALB DNS
  - [ ] edusync.io → $ALB_DNS
  - [ ] api.edusync.io → $ALB_DNS
  - [ ] admin.edusync.io → $ALB_DNS
- [ ] SSL certificate requested (AWS Certificate Manager)
- [ ] ALB listener updated to HTTPS

## MONITORING & ALERTING

- [ ] CloudWatch dashboards created
- [ ] SNS topic for alerts
- [ ] CloudWatch alarms configured
  - [ ] CPU utilization > 80%
  - [ ] Memory utilization > 85%
  - [ ] Health check failures
  - [ ] Database connection errors
- [ ] Sentry project created
- [ ] DataDog agent configured (optional)

## DATABASES

- [ ] PostgreSQL RDS
  - [ ] Endpoint: `edusync-postgres-prod.xxxxx.us-east-1.rds.amazonaws.com`
  - [ ] Security group allows port 5432 from ECS
  - [ ] Backups enabled (30 days retention)
- [ ] DocumentDB (MongoDB)
  - [ ] Endpoint: `edusync-documentdb-prod.xxxxx.us-east-1.docdb.amazonaws.com`
  - [ ] Encryption enabled
  - [ ] Backups enabled
- [ ] ElastiCache Redis
  - [ ] Endpoint: `edusync-redis-prod.xxxxx.cache.amazonaws.com`
  - [ ] Encryption at rest enabled
  - [ ] Encryption in transit enabled

## BACKUP & DISASTER RECOVERY

- [ ] Database backup schedule configured
- [ ] Backup retention policy set (30 days)
- [ ] Test restore procedure documented
- [ ] Disaster recovery playbook created

## SECURITY

- [ ] Security groups configured
  - [ ] ALB: Port 80, 443 from 0.0.0.0/0
  - [ ] ECS: Ports 3000, 3001, 3002 from ALB only
  - [ ] RDS: Port 5432 from ECS only
  - [ ] DocumentDB: Port 27017 from ECS only
  - [ ] Redis: Port 6379 from ECS only
- [ ] Secrets Manager accessed via IAM roles
- [ ] VPC endpoints configured (optional)
- [ ] WAF rules configured (optional)

## GO-LIVE PROCEDURES

- [ ] Load testing completed (k6)
- [ ] Smoke tests passing
- [ ] Performance benchmarks met
- [ ] Incident response plan documented
- [ ] On-call rotation established
- [ ] Runbook created

## POST-DEPLOYMENT

- [ ] Monitor logs for errors (1 hour)
- [ ] Check CPU/Memory utilization
- [ ] Verify auto-scaling triggers
- [ ] Test failover procedures
- [ ] Send launch notification

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Approved By**: _________________

✅ **PRODUCTION DEPLOYMENT COMPLETE**
