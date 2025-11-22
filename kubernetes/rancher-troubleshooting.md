Se o Rancher estiver rodando, você pode expor ele de algumas formas:

Opção 1: Port-Forward (acesso local rápido)
bashkubectl port-forward -n cattle-system svc/rancher 8443:443
Depois acesse: https://localhost:8443

Opção 2: Via LoadBalancer
bash# Alterar o serviço para LoadBalancer
kubectl patch svc rancher -n cattle-system -p '{"spec": {"type": "LoadBalancer"}}'

# Aguardar e pegar a URL
kubectl get svc rancher -n cattle-system -w
A URL será o EXTERNAL-IP que aparecer.

Opção 3: Ver a senha inicial do Rancher
bash# Se você definiu bootstrapPassword no helm install
echo "Senha: Admin123!"

# Ou pegar a senha gerada automaticamente
kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}{{"\n"}}'

Se o Rancher não estiver instalado ainda, você pode instalar com:
bash# Instalar cert-manager primeiro
helm repo add jetstack https://charts.jetstack.io
helm repo update
kubectl create namespace cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v1.13.0 \
  --set installCRDs=true