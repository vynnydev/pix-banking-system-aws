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

# Instalar Rancher
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm repo update
kubectl create namespace cattle-system
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=rancher.local \
  --set bootstrapPassword=Admin123! \
  --set replicas=1

Rodar o Rancher:
kubectl port-forward -n cattle-system svc/rancher 8443:443
```

Você deve ver algo como:
```
Forwarding from 127.0.0.1:8443 -> 443
Forwarding from [::1]:8443 -> 443
```

**2. Com o terminal acima ABERTO, acesse no navegador:**
```
https://localhost:8443
```

---

**Alternativa: Acessar direto pelo LoadBalancer da AWS**

Como o LoadBalancer já está provisionado, tente:
```
https://a48543b6edd614cd4ab1ba1dc7219791-1371049969.us-east-1.elb.amazonaws.com