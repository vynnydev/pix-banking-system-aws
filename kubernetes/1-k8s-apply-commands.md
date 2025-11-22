# PIX Banking System - Kubernetes Deployment

Este documento contém os comandos necessários para fazer o deploy do PIX Banking System no Amazon EKS.

---

## Pré-requisitos

- AWS CLI configurado
- kubectl instalado
- Helm instalado
- Cluster EKS criado via Terraform

---

## Passo a Passo do Deploy

### 1. Configurar kubectl

```bash
aws eks update-kubeconfig --region us-east-1 --name pix-banking-system-dev-eks
```

### 2. Criar o Namespace

```bash
kubectl apply -f microservices-namespace.yaml
```

### 3. Aplicar ConfigMaps e Secrets

```bash
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
```

### 4. Aplicar RBAC

```bash
kubectl apply -f roles.yaml
kubectl apply -f rolebindings.yaml
```

### 5. Aplicar ServiceAccounts

```bash
kubectl apply -f auth-service/serviceaccount.yaml
kubectl apply -f transaction-service/serviceaccount.yaml
kubectl apply -f settlement-service/serviceaccount.yaml
```

### 6. Aplicar Services

```bash
kubectl apply -f auth-service/service.yaml
kubectl apply -f transaction-service/service.yaml
kubectl apply -f settlement-service/service.yaml
```

### 7. Aplicar Deployments

```bash
kubectl apply -f auth-service/deployment.yaml
kubectl apply -f transaction-service/deployment.yaml
kubectl apply -f settlement-service/deployment.yaml
```

### 8. Aplicar HPAs (Horizontal Pod Autoscalers)

```bash
kubectl apply -f auth-service/hpa.yaml
kubectl apply -f transaction-service/hpa.yaml
```

### 9. Aplicar CronJob

```bash
kubectl apply -f settlement-service/cronjob.yaml
```

### 10. Aplicar Network Policy

```bash
kubectl apply -f network-policy.yaml
```

### 11. Aplicar Ingress (após instalar o ALB Controller)

```bash
kubectl apply -f alb-api-gateway-ingress-controller.yaml
```

---

## Verificação

```bash
kubectl get all -n pix-microservices
```

---

## Comandos Úteis

```bash
# Ver pods
kubectl get pods -n pix-microservices

# Ver logs de um serviço
kubectl logs -n pix-microservices deployment/auth-service

# Descrever um pod
kubectl describe pod <pod-name> -n pix-microservices

# Ver eventos
kubectl get events -n pix-microservices --sort-by='.lastTimestamp'
```