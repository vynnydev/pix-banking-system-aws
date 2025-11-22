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