# Rancher - Instalação e Acesso

Este documento contém os comandos necessários para instalar e acessar o Rancher no Amazon EKS.

---

## Instalação do Rancher

### 1. Adicionar repositório Helm

```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm repo update
```

### 2. Criar namespace

```bash
kubectl create namespace cattle-system
```

### 3. Instalar Rancher

```bash
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=rancher.local \
  --set bootstrapPassword=Admin123! \
  --set replicas=1
```

---

## Acessar o Rancher

### Opção 1: Port-Forward (Acesso Local)

**1. Execute o comando abaixo e mantenha o terminal aberto:**

```bash
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

> ⚠️ O navegador vai mostrar um aviso de certificado (self-signed). Clique em "Avançado" → "Continuar mesmo assim".

---

### Opção 2: LoadBalancer da AWS (Acesso Externo)

Se o LoadBalancer já estiver provisionado, acesse diretamente:

```
https://a48543b6edd614cd4ab1ba1dc7219791-1371049969.us-east-1.elb.amazonaws.com
```

> ⚠️ Use **https://** (não http). Aceite o aviso de certificado no navegador.

---

## Credenciais de Acesso

- **Usuário:** admin
- **Senha:** Admin123!

---

## Comandos Úteis

```bash
# Verificar status dos pods do Rancher
kubectl get pods -n cattle-system

# Verificar serviços do Rancher
kubectl get svc -n cattle-system

# Ver logs do Rancher
kubectl logs -n cattle-system -l app=rancher --tail=50
```