#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 PIX Banking System - Build & Push${NC}"

# Config
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1
export PROJECT_NAME=pix-banking-system-dev

echo -e "${GREEN}✅ Account: $ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ Region: $AWS_REGION${NC}"
echo -e "${GREEN}✅ Project: $PROJECT_NAME${NC}"

# Login
echo -e "${BLUE}🔐 Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to login to ECR${NC}"
  exit 1
fi

# Build each service
SERVICES=("auth-service" "transaction-service" "settlement-service")

for SERVICE in "${SERVICES[@]}"; do
  echo -e "${BLUE}🔨 Building $SERVICE...${NC}"
  
  # Go to service directory
  cd ../application/$SERVICE
  
  # Build
  docker buildx build \
    --platform linux/amd64 \
    -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$SERVICE:latest \
    .
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build $SERVICE${NC}"
    cd ..
    exit 1
  fi
  
  # Push
  echo -e "${BLUE}📤 Pushing $SERVICE...${NC}"
  docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$SERVICE:latest
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push $SERVICE${NC}"
    cd ../scripts
    exit 1
  fi
  
  # Return to root
  cd ../../scripts
  
  echo -e "${GREEN}✅ $SERVICE completed!${NC}"
done

echo -e "${GREEN}🎉 ALL IMAGES BUILT AND PUSHED SUCCESSFULLY!${NC}"

# Verify
echo -e "${BLUE}📦 Verifying images in ECR...${NC}"
for SERVICE in "${SERVICES[@]}"; do
  echo -e "${BLUE}Checking $SERVICE...${NC}"
  aws ecr describe-images \
    --repository-name $PROJECT_NAME-$SERVICE \
    --region $AWS_REGION \
    --query 'imageDetails[0].[imagePushedAt,imageSizeInBytes]' \
    --output table
done

echo -e "${GREEN}✅ All done! Images are ready in ECR!${NC}"