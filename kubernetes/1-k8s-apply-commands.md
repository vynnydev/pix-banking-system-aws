# 1. Configurar kubectl
aws eks update-kubeconfig --region us-east-1 --name pix-banking-system-dev-eks

# 2. Criar o namespace primeiro
kubectl apply -f microservices-namespace.yaml

# 3. Aplicar ConfigMaps e Secrets
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# 4. Aplicar RBAC
kubectl apply -f roles.yaml
kubectl apply -f rolebindings.yaml

# 5. Aplicar ServiceAccounts
kubectl apply -f auth-service/serviceaccount.yaml
kubectl apply -f transaction-service/serviceaccount.yaml
kubectl apply -f settlement-service/serviceaccount.yaml

# 6. Aplicar Services
kubectl apply -f auth-service/service.yaml
kubectl apply -f transaction-service/service.yaml
kubectl apply -f settlement-service/service.yaml

# 7. Aplicar Deployments
kubectl apply -f auth-service/deployment.yaml
kubectl apply -f transaction-service/deployment.yaml
kubectl apply -f settlement-service/deployment.yaml

# 8. Aplicar HPAs
kubectl apply -f auth-service/hpa.yaml
kubectl apply -f transaction-service/hpa.yaml

# 9. Aplicar CronJob
kubectl apply -f settlement-service/cronjob.yaml

# 10. Aplicar Network Policy
kubectl apply -f network-policy.yaml

# 11. Por último, o Ingress (depois de instalar o ALB Controller)
kubectl apply -f alb-api-gateway-ingress-controller.yaml

# Verificar tudo
kubectl get all -n pix-microservices