#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PIX BANKING SYSTEM - DEPLOY TO KUBERNETES           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"

# Get values from Terraform
cd ../infrastructure/terraform
export ACCOUNT_ID=$(terraform output -raw eks_cluster_name | grep -o '[0-9]\{12\}' || aws sts get-caller-identity --query Account --output text)
export REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
export SNS_TOPIC_ARN=$(terraform output -raw sns_topic_arn)
export SQS_QUEUE_URL=$(terraform output -raw sqs_queue_url)
cd ../../kubernetes

echo -e "${GREEN}✅ Account ID: $ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ Redis: $REDIS_ENDPOINT${NC}"

# Update ConfigMap with real values
echo -e "${BLUE}📝 Creating ConfigMaps...${NC}"
cat > ../kubernetes/configmap.yaml <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: dynamodb-config
  namespace: microservices
data:
  users_table: "pix-banking-system-dev-users"
  accounts_table: "pix-banking-system-dev-accounts"
  transactions_table: "pix-banking-system-dev-transactions"
  pixkeys_table: "pix-banking-system-dev-pixkeys"
  notifications_table: "pix-banking-system-dev-notifications"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
  namespace: microservices
data:
  host: "$REDIS_ENDPOINT"
  port: "6379"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: sns-config
  namespace: microservices
data:
  topic_arn: "$SNS_TOPIC_ARN"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: sqs-config
  namespace: microservices
data:
  queue_url: "$SQS_QUEUE_URL"
EOF

# Update ServiceAccounts with Account ID
echo -e "${BLUE}📝 Updating ServiceAccounts...${NC}"
find ../kubernetes -name "serviceaccount.yaml" -exec sed -i '' "s/<ACCOUNT_ID>/$ACCOUNT_ID/g" {} \;

# Update Deployments with Account ID
echo -e "${BLUE}📝 Updating Deployments...${NC}"
find ../kubernetes -name "deployment.yaml" -exec sed -i '' "s/<ACCOUNT_ID>/$ACCOUNT_ID/g" {} \;

# Deploy
echo -e "${BLUE}🚀 Deploying to Kubernetes...${NC}"

kubectl apply -f ../kubernetes/namespace/
kubectl apply -f ../kubernetes/configmap.yaml
kubectl apply -f ../kubernetes/secrets.yaml
kubectl apply -f ../kubernetes/rbac/

echo -e "${YELLOW}⏳ Deploying microservices...${NC}"
kubectl apply -f ../kubernetes/auth-service/
kubectl apply -f ../kubernetes/transaction-service/
kubectl apply -f ../kubernetes/settlement-service/

echo -e "${YELLOW}⏳ Deploying Ingress...${NC}"
kubectl apply -f ../kubernetes/ingress/

echo -e "${BLUE}⏳ Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=auth-service -n microservices --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=transaction-service -n microservices --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=settlement-service -n microservices --timeout=300s || true

echo -e "${GREEN}✅ Deployment complete!${NC}"

echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get pods -n microservices
kubectl get svc -n microservices
kubectl get ingress -n microservices

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    DEPLOYMENT COMPLETE                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"

echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Check pods: ${BLUE}kubectl get pods -n microservices -w${NC}"
echo -e "2. Get ALB URL: ${BLUE}kubectl get ingress api-gateway -n microservices${NC}"
echo -e "3. Test API: ${BLUE}curl http://<ALB_URL>/api/auth/health${NC}"