# Voltar para 2 réplicas (estado original)
kubectl scale deployment auth-service -n pix-microservices --replicas=2
kubectl scale deployment transaction-service -n pix-microservices --replicas=2
kubectl scale deployment settlement-service -n pix-microservices --replicas=2

# Verificar
kubectl get pods -n pix-microservices