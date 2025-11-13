# 🏦 PIX Banking System - Cloud Infrastructure

[![Terraform](https://img.shields.io/badge/Terraform-1.5+-623CE4?logo=terraform)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28+-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema bancário completo para transferências PIX com arquitetura de microserviços na AWS.

## Microserviços da aplicação no Rancher
![rancher](./docs/rancher.png)

## Link do rancher: https://a51ac781483a549b3b6937162f4eae27-440043048.us-east-1.elb.amazonaws.com/dashboard/home
- Login: admin
- Senha: Admin123!
---

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Infraestrutura](#-infraestrutura)
- [Microserviços](#-microserviços)
- [Deploy](#-deploy)
- [Evidências](#-evidências)
- [Custos](#-custos)

---

## 🏗️ Arquitetura
```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐      ┌──────────────────────────────────┐    │
│  │   ALB    │─────▶│         EKS Cluster              │    │
│  │ Ingress  │      │  ┌────────────────────────────┐  │    │
│  └──────────┘      │  │   Auth Service (Python)    │  │    │
│                    │  │   Transaction Service      │  │    │
│                    │  │   Settlement Service       │  │    │
│                    │  └────────────────────────────┘  │    │
│                    └──────────────────────────────────┘    │
│                                                             │
│  ┌──────────────┐   ┌──────────┐   ┌──────────┐          │
│  │  DynamoDB    │   │   SNS    │   │   SQS    │          │
│  │  5 Tables    │   │  Topic   │   │  Queue   │          │
│  └──────────────┘   └──────────┘   └──────────┘          │
│                                                             │
│  ┌──────────────┐   ┌──────────┐                          │
│  │ ElastiCache  │   │   ECR    │                          │
│  │    Redis     │   │  Images  │                          │
│  └──────────────┘   └──────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### **Infraestrutura**
- **Terraform** - Infrastructure as Code
- **AWS EKS** - Kubernetes gerenciado
- **AWS VPC** - Rede isolada com subnets públicas/privadas
- **AWS ALB** - Application Load Balancer
- **Docker** - Containerização

### **Databases**
- **DynamoDB** - NoSQL para dados transacionais
- **ElastiCache (Redis)** - Cache em memória

### **Messaging**
- **SNS** - Pub/Sub para notificações
- **SQS** - Filas para processamento assíncrono

### **Backend**
- **Python 3.11** - Linguagem dos microserviços
- **Flask** - Framework web
- **Boto3** - SDK AWS

### **DevOps**
- **Kubernetes** - Orquestração de containers
- **Helm** - Gerenciador de pacotes K8s
- **ALB Ingress Controller** - Roteamento de tráfego

---

## 🏢 Infraestrutura

### **Recursos AWS Criados**

| Recurso | Quantidade | Descrição |
|---------|------------|-----------|
| VPC | 1 | Rede privada com CIDR 10.0.0.0/16 |
| Subnets Privadas | 2 | Para workloads internos |
| Subnets Públicas | 2 | Para ALB e NAT Gateway |
| NAT Gateway | 2 | Conectividade internet para subnets privadas |
| EKS Cluster | 1 | Kubernetes 1.28 |
| EC2 Nodes | 2-3 | t3.small para worker nodes |
| DynamoDB Tables | 5 | users, accounts, transactions, pixkeys, notifications |
| SNS Topic | 1 | Notificações de transações |
| SQS Queue | 1 | Processamento assíncrono |
| ElastiCache | 1 | Redis t3.micro |
| ECR Repositories | 3 | Imagens Docker |
| ALB | 1 | Application Load Balancer |

---

## 🚀 Microserviços

### **1. Auth Service**
**Porta:** 3000  
**Endpoints:**
- `GET /health` - Health check
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/users/:id` - Buscar usuário

**Dependências:**
- DynamoDB (users, accounts)
- Redis (cache de tokens)

### **2. Transaction Service**
**Porta:** 3000  
**Endpoints:**
- `GET /health` - Health check
- `POST /api/transactions` - Criar transação PIX
- `GET /api/transactions/:id` - Buscar transação

**Dependências:**
- DynamoDB (transactions, accounts)
- Redis (cache)
- SNS (notificações)

### **3. Settlement Service**
**Porta:** 3000  
**Endpoints:**
- `GET /health` - Health check
- `POST /api/settlement/process` - Processar liquidação
- `GET /api/settlement/report` - Relatório de transações

**Dependências:**
- DynamoDB (transactions)
- SQS (fila de processamento)

---

## 📦 Deploy

### **Pré-requisitos**
```bash
# Ferramentas necessárias
- AWS CLI 2.x
- Terraform 1.5+
- kubectl 1.28+
- Docker 20.x+
- Helm 3.x+
```

### **1. Provisionar Infraestrutura**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### **2. Configurar kubectl**
```bash
aws eks update-kubeconfig --region us-east-1 --name pix-banking-system-dev-eks
kubectl get nodes
```

### **3. Instalar ALB Ingress Controller**
```bash
./scripts/04-install-alb-controller.sh
```

### **4. Build e Push Imagens**
```bash
./scripts/03-build-push-images.sh
```

### **5. Deploy Microserviços**
```bash
./scripts/05-deploy-kubernetes.sh
```

### **6. Verificar Deploy**
```bash
kubectl get pods -n pix-microservices
kubectl get ingress -n pix-microservices
```

---

## 📊 Evidências

### **Comandos para Colher Evidências**
```bash
# 1. INFRAESTRUTURA TERRAFORM
cd infrastructure/terraform
terraform output deployment_summary > ../../docs/evidences/01-terraform-output.txt
terraform state list > ../../docs/evidences/02-terraform-resources.txt

# 2. VPC E REDE
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=pix-banking-system-dev-vpc" > docs/evidences/03-vpc.json
aws ec2 describe-subnets --filters "Name=tag:Project,Values=pix-banking-system" > docs/evidences/04-subnets.json

# 3. EKS CLUSTER
kubectl get nodes -o wide > docs/evidences/05-eks-nodes.txt
kubectl cluster-info > docs/evidences/06-cluster-info.txt
kubectl get all --all-namespaces > docs/evidences/07-all-resources.txt

# 4. DYNAMODB
aws dynamodb list-tables > docs/evidences/08-dynamodb-tables.json
aws dynamodb describe-table --table-name pix-banking-system-dev-users > docs/evidences/09-users-table.json

# 5. SNS/SQS
aws sns list-topics > docs/evidences/10-sns-topics.json
aws sqs list-queues > docs/evidences/11-sqs-queues.json

# 6. ECR
aws ecr describe-repositories > docs/evidences/12-ecr-repos.json
aws ecr list-images --repository-name pix-banking-system-dev-auth-service > docs/evidences/13-ecr-images.json

# 7. ELASTICACHE
aws elasticache describe-cache-clusters > docs/evidences/14-redis.json

# 8. PODS E SERVICES
kubectl get pods -n pix-microservices -o wide > docs/evidences/15-pods.txt
kubectl get svc -n pix-microservices > docs/evidences/16-services.txt
kubectl get ingress -n pix-microservices > docs/evidences/17-ingress.txt

# 9. LOGS DOS MICROSERVIÇOS
kubectl logs -l app=auth-service -n pix-microservices --tail=50 > docs/evidences/18-auth-logs.txt
kubectl logs -l app=transaction-service -n pix-microservices --tail=50 > docs/evidences/19-transaction-logs.txt
kubectl logs -l app=settlement-service -n pix-microservices --tail=50 > docs/evidences/20-settlement-logs.txt

# 10. HEALTH CHECKS
ALB_URL=$(kubectl get ingress api-gateway -n pix-microservices -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$ALB_URL/api/auth/health > docs/evidences/21-auth-health.json
curl http://$ALB_URL/api/transactions/health > docs/evidences/22-transaction-health.json
curl http://$ALB_URL/api/settlement/health > docs/evidences/23-settlement-health.json

# 11. SCREENSHOTS
echo "Tire prints de:"
echo "- AWS Console > VPC Dashboard"
echo "- AWS Console > EKS Cluster"
echo "- AWS Console > DynamoDB Tables"
echo "- AWS Console > ECR Repositories"
echo "- Rancher Dashboard (se instalado)"
```

### **Estrutura de Evidências**
```
docs/
└── evidences/
    ├── 01-terraform-output.txt
    ├── 02-terraform-resources.txt
    ├── 03-vpc.json
    ├── ...
    ├── 23-settlement-health.json
    └── screenshots/
        ├── aws-vpc.png
        ├── aws-eks.png
        ├── aws-dynamodb.png
        └── rancher-dashboard.png
```

---

## 💰 Custos

### **Estimativa Mensal**

| Recurso | Custo/mês |
|---------|-----------|
| EKS Control Plane | $72.00 |
| EC2 Nodes (2x t3.small) | $30.00 |
| NAT Gateway | $32.00 |
| ALB | $16.00 |
| ElastiCache (t3.micro) | $12.50 |
| DynamoDB (on-demand) | $5.00 |
| SNS/SQS | $1.00 |
| ECR | $0.12 |
| **TOTAL** | **~$168.62/mês** |

### **Dicas para Reduzir Custos**
- Deletar cluster quando não estiver usando
- Usar Spot Instances para nodes
- Desabilitar NAT Gateway em ambientes de teste

---

## 🧹 Destruir Infraestrutura
```bash
# Deletar recursos Kubernetes
kubectl delete namespace pix-microservices

# Deletar infraestrutura AWS
cd infrastructure/terraform
terraform destroy
```

---

## 👨‍💻 Autor

**Vinicius** - RM555221  
FIAP - Cloud Computing & DevOps  
Novembro 2025

---

## 📝 Licença

Este projeto é licenciado sob a MIT License.

---

## 🎯 Próximos Passos

- [ ] Implementar CI/CD com GitHub Actions
- [ ] Adicionar ArgoCD para GitOps
- [ ] Integrar Trivy para security scanning
- [ ] Configurar SonarQube para análise de código
- [ ] Implementar Prometheus + Grafana para observabilidade
- [ ] Adicionar Istio service mesh