#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Coletando Evidências do PIX Banking System${NC}"

# Criar diretório
mkdir -p docs/evidences

cd docs/evidences

echo -e "${GREEN}1/11 Terraform outputs...${NC}"
cd ../infrastructure/terraform
terraform output deployment_summary > ../../docs/evidences/01-terraform-output.txt
terraform state list > ../../docs/evidences/02-terraform-resources.txt
cd ../../docs/evidences

echo -e "${GREEN}2/11 VPC...${NC}"
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=pix-banking-system-dev-vpc" > 03-vpc.json

echo -e "${GREEN}3/11 EKS...${NC}"
kubectl get nodes -o wide > 05-eks-nodes.txt
kubectl cluster-info > 06-cluster-info.txt

echo -e "${GREEN}4/11 DynamoDB...${NC}"
aws dynamodb list-tables > 08-dynamodb-tables.json

echo -e "${GREEN}5/11 SNS/SQS...${NC}"
aws sns list-topics > 10-sns-topics.json
aws sqs list-queues > 11-sqs-queues.json

echo -e "${GREEN}6/11 ECR...${NC}"
aws ecr describe-repositories > 12-ecr-repos.json

echo -e "${GREEN}7/11 ElastiCache...${NC}"
aws elasticache describe-cache-clusters > 14-redis.json

echo -e "${GREEN}8/11 Pods...${NC}"
kubectl get pods -n pix-microservices -o wide > 15-pods.txt
kubectl get svc -n pix-microservices > 16-services.txt
kubectl get ingress -n pix-microservices > 17-ingress.txt

echo -e "${GREEN}9/11 Logs...${NC}"
kubectl logs -l app=auth-service -n pix-microservices --tail=50 > 18-auth-logs.txt 2>&1 || true

echo -e "${GREEN}10/11 Health checks...${NC}"
ALB_URL=$(kubectl get ingress api-gateway -n pix-microservices -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")
if [ "$ALB_URL" != "pending" ]; then
  curl -s http://$ALB_URL/api/auth/health > 21-auth-health.json 2>&1 || echo "Pending" > 21-auth-health.json
fi

echo -e "${GREEN}11/11 Criando README das evidências...${NC}"
cat > README.md <<EOF
# Evidências - PIX Banking System

Data: $(date)

## Arquivos Gerados

1. **01-terraform-output.txt** - Output completo do Terraform
2. **02-terraform-resources.txt** - Lista de recursos criados
3. **03-vpc.json** - Detalhes da VPC
4. **05-eks-nodes.txt** - Nodes do cluster EKS
5. **08-dynamodb-tables.json** - Tabelas DynamoDB
6. **12-ecr-repos.json** - Repositórios ECR
7. **15-pods.txt** - Pods rodando no Kubernetes
8. **16-services.txt** - Services do Kubernetes
9. **17-ingress.txt** - Ingress ALB

## Screenshots Necessários

Tire prints de:
- AWS Console > VPC
- AWS Console > EKS
- AWS Console > DynamoDB
- AWS Console > ECR
- Terminal com kubectl get pods
EOF

echo -e "${GREEN}✅ Evidências coletadas em docs/evidences/${NC}"
echo -e "${BLUE}📸 Não esqueça de tirar screenshots do AWS Console!${NC}"