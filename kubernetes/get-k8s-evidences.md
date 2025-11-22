# PIX Banking System - Comandos para Coleta de Evidências

**RM:** 555221  
**Projeto:** PIX Banking System  
**Ambiente:** AWS EKS  

---

## Pré-requisitos

```bash
# Configurar kubectl
aws eks update-kubeconfig --region us-east-1 --name pix-banking-system-dev-eks

# Verificar conexão
kubectl cluster-info
kubectl get nodes
```

---

## Etapa 1: Docker - Build, Push e Scan (1,5 pts)

### 1.1 Login no ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 347277718217.dkr.ecr.us-east-1.amazonaws.com
```

### 1.2 Docker Push com Tag Versionada
```bash
# Build e push das imagens (se necessário)
docker build -f auth-service/Dockerfile -t 347277718217.dkr.ecr.us-east-1.amazonaws.com/pix-banking-system-dev-auth-service:latest .
docker push 347277718217.dkr.ecr.us-east-1.amazonaws.com/pix-banking-system-dev-auth-service:latest
```

### 1.3 Docker Scout - Scan de Vulnerabilidades
```bash
docker scout cves 347277718217.dkr.ecr.us-east-1.amazonaws.com/pix-banking-system-dev-auth-service:latest
docker scout cves 347277718217.dkr.ecr.us-east-1.amazonaws.com/pix-banking-system-dev-transaction-service:latest
docker scout cves 347277718217.dkr.ecr.us-east-1.amazonaws.com/pix-banking-system-dev-settlement-service:latest
```

---

## Etapa 2: Rede, Comunicação e Segmentação (2,5 pts)

### 2.1 Network Policies Configuradas
```bash
# Listar Network Policies
kubectl get networkpolicy -n pix-microservices

# Descrever cada policy
kubectl describe networkpolicy auth-service-netpol -n pix-microservices
kubectl describe networkpolicy transaction-service-netpol -n pix-microservices
kubectl describe networkpolicy settlement-service-netpol -n pix-microservices
```

### 2.2 Comunicação entre Pods
```bash
# Criar pod de teste e executar curls
kubectl run curl-test --image=curlimages/curl -i --tty --rm -n pix-microservices -- sh

# Dentro do pod, executar:
# curl http://auth-service:3000/health
# curl http://transaction-service:3000/health
# curl http://settlement-service:3000/health
# exit
```

### 2.3 Logs com Variáveis de Ambiente
```bash
kubectl logs -n pix-microservices deployment/auth-service | grep -i "dynamodb\|redis\|aws"
kubectl logs -n pix-microservices deployment/transaction-service | grep -i "dynamodb\|redis\|sns"
kubectl logs -n pix-microservices deployment/auth-service --tail=50
```

---

## Etapa 3: Kubernetes - Estrutura, Escala e Deploy (3,0 pts)

### 3.1 Pods com 2 Réplicas
```bash
kubectl get pods -n pix-microservices -o wide
```

### 3.2 Scaling de Deployments
```bash
# Escalar para 4 réplicas
kubectl scale deployment auth-service -n pix-microservices --replicas=4
kubectl scale deployment transaction-service -n pix-microservices --replicas=4
kubectl scale deployment settlement-service -n pix-microservices --replicas=4

# Aguardar e verificar
sleep 15
kubectl get pods -n pix-microservices -o wide

# Voltar para 2 réplicas
kubectl scale deployment auth-service -n pix-microservices --replicas=2
kubectl scale deployment transaction-service -n pix-microservices --replicas=2
kubectl scale deployment settlement-service -n pix-microservices --replicas=2
```

### 3.3 Logs de Múltiplos Pods
```bash
# Listar pods
kubectl get pods -n pix-microservices

# Logs de pods específicos (substituir pelos nomes reais)
kubectl logs -n pix-microservices <transaction-pod-1> --tail=50
kubectl logs -n pix-microservices <transaction-pod-2> --tail=50
kubectl logs -n pix-microservices <settlement-pod-1> --tail=50
```

### 3.4 CronJob Executado
```bash
# Criar job manual a partir do cronjob
kubectl delete job settlement-manual-test -n pix-microservices 2>/dev/null || true
kubectl create job settlement-manual-test --from=cronjob/settlement-cronjob -n pix-microservices

# Verificar execução
kubectl get jobs -n pix-microservices
kubectl describe cronjob settlement-cronjob -n pix-microservices
```

---

## Etapa 4: Segurança, Observação e Operação (2,0 pts)

### 4.1 Limites de CPU/Memória
```bash
kubectl top pods -n pix-microservices
kubectl describe pod -n pix-microservices -l app=auth-service | grep -A 10 "Limits:"
```

### 4.2 SecurityContext Configurado
```bash
kubectl get deployment auth-service -n pix-microservices -o yaml | grep -A 10 securityContext
kubectl get deployment transaction-service -n pix-microservices -o yaml | grep -A 10 securityContext
```

### 4.3 Pod Inseguro vs Pod Seguro
```bash
# Aplicar deployment inseguro de teste
kubectl apply -f kubernetes/evidences/insecure-test-deployment.yaml

# Verificar pod inseguro rodando como root
kubectl get pods -n pix-microservices -l app=insecure-test
POD_INSECURE=$(kubectl get pods -n pix-microservices -l app=insecure-test -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n pix-microservices $POD_INSECURE -- whoami

# Verificar pod seguro rodando como non-root
POD_AUTH=$(kubectl get pods -n pix-microservices -l app=auth-service -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n pix-microservices $POD_AUTH -- id

# Limpar
kubectl delete deployment insecure-test-deployment -n pix-microservices
```

### 4.4 Permissões Restritas (RBAC)
```bash
# Testar permissões do ServiceAccount
kubectl auth can-i get pods --as=system:serviceaccount:pix-microservices:auth-service -n pix-microservices
kubectl auth can-i delete pods --as=system:serviceaccount:pix-microservices:auth-service -n pix-microservices
kubectl auth can-i delete secrets --as=system:serviceaccount:pix-microservices:auth-service -n pix-microservices

# Ver roles e bindings
kubectl get rolebinding -n pix-microservices
kubectl get role microservices-role -n pix-microservices -o yaml
```

---

## Comandos Úteis

### Status Geral
```bash
kubectl get all -n pix-microservices
```

### Verificar Ingress/ALB
```bash
kubectl get ingress -n pix-microservices
kubectl describe ingress api-gateway -n pix-microservices
```

### Verificar Rancher
```bash
kubectl get pods -n cattle-system
kubectl get svc -n cattle-system
kubectl port-forward -n cattle-system svc/rancher 8443:443
```

---

## Checklist de Evidências

- [ ] 1.2 - Docker Push com tag versionada
- [ ] 1.3 - Docker Scout sem vulnerabilidades críticas
- [ ] 2.1 - Network Policies isolando tráfego
- [ ] 2.2 - Curl entre containers funcionando
- [ ] 2.3 - Logs mostrando leitura de ConfigMaps
- [ ] 3.1 - kubectl get pods mostrando 2 réplicas
- [ ] 3.2 - kubectl scale aumentando réplicas
- [ ] 3.3 - Logs de pods diferentes
- [ ] 3.4 - CronJob criado e executado
- [ ] 4.1 - Recursos limitados (CPU/Memory)
- [ ] 4.2 - SecurityContext com runAsNonRoot: true
- [ ] 4.3 - Pod rodando como root (inseguro) vs non-root (seguro)
- [ ] 4.4 - Permissões RBAC restritas