#!/bin/bash

#######################################################################
#  PIX BANKING SYSTEM - SCRIPT DE COLETA DE EVIDÊNCIAS
#  RM: 555221
#  Data: $(date +%Y-%m-%d)
#######################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

NAMESPACE="pix-microservices"
ECR_REGISTRY="347277718217.dkr.ecr.us-east-1.amazonaws.com"

print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${YELLOW}$1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_subheader() {
    echo ""
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${GREEN}────────────────────────────────────────────────────────────────────────────${NC}"
}

print_command() {
    echo -e "${BLUE}$ $1${NC}"
}

pause_for_screenshot() {
    echo ""
    echo -e "${YELLOW}📸 Tire o screenshot agora! Pressione ENTER para continuar...${NC}"
    read -r
}

#######################################################################
# ETAPA 1: DOCKER (1.2 e 1.3)
#######################################################################
etapa1_docker() {
    print_header "ETAPA 1: DOCKER - Build, Push e Scan de Vulnerabilidades"

    print_subheader "1.2 & 1.3 - Docker Scout - Scan de Vulnerabilidades"
    
    echo -e "${YELLOW}Escaneando auth-service...${NC}"
    print_command "docker scout cves ${ECR_REGISTRY}/pix-banking-system-dev-auth-service:latest"
    docker scout cves ${ECR_REGISTRY}/pix-banking-system-dev-auth-service:latest
    pause_for_screenshot

    echo -e "${YELLOW}Escaneando transaction-service...${NC}"
    print_command "docker scout cves ${ECR_REGISTRY}/pix-banking-system-dev-transaction-service:latest"
    docker scout cves ${ECR_REGISTRY}/pix-banking-system-dev-transaction-service:latest
    pause_for_screenshot

    echo -e "${YELLOW}Escaneando settlement-service...${NC}"
    print_command "docker scout cves ${ECR_REGISTRY}/pix-banking-system-dev-settlement-service:latest"
    docker scout cves ${ECR_REGISTRY}/pix-banking-system-dev-settlement-service:latest
    pause_for_screenshot

    echo -e "${GREEN}✅ Etapa 1 concluída!${NC}"
}

#######################################################################
# ETAPA 2: REDE, COMUNICAÇÃO E SEGMENTAÇÃO
#######################################################################
etapa2_rede() {
    print_header "ETAPA 2: REDE, COMUNICAÇÃO E SEGMENTAÇÃO (2,5 pts)"

    print_subheader "2.0 - Criando Network Policies (se não existirem)"
    
    # Criar Network Policies separadas por serviço
    echo -e "${YELLOW}Aplicando Network Policies...${NC}"
    
    cat <<EOF | kubectl apply -f -
# Network Policy - Auth Service
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service-netpol
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: pix-microservices
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 6379
---
# Network Policy - Transaction Service
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: transaction-service-netpol
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: transaction-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: pix-microservices
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 6379
    - protocol: TCP
      port: 3000
---
# Network Policy - Settlement Service
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: settlement-service-netpol
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: settlement-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: pix-microservices
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
EOF

    echo -e "${GREEN}✅ Network Policies criadas!${NC}"
    sleep 2

    print_subheader "2.1 - Network Policies Configuradas"
    print_command "kubectl get networkpolicy -n ${NAMESPACE}"
    kubectl get networkpolicy -n ${NAMESPACE}
    pause_for_screenshot

    print_command "kubectl describe networkpolicy auth-service-netpol -n ${NAMESPACE}"
    kubectl describe networkpolicy auth-service-netpol -n ${NAMESPACE}
    pause_for_screenshot

    print_command "kubectl describe networkpolicy transaction-service-netpol -n ${NAMESPACE}"
    kubectl describe networkpolicy transaction-service-netpol -n ${NAMESPACE}
    pause_for_screenshot

    print_command "kubectl describe networkpolicy settlement-service-netpol -n ${NAMESPACE}"
    kubectl describe networkpolicy settlement-service-netpol -n ${NAMESPACE}
    pause_for_screenshot

    print_subheader "2.2 - Comunicação entre Pods"
    echo -e "${YELLOW}Criando pod de teste para curl...${NC}"
    print_command "kubectl run curl-test --image=curlimages/curl -i --tty --rm -n ${NAMESPACE} -- sh"
    echo -e "${YELLOW}Execute os comandos abaixo dentro do pod:${NC}"
    echo -e "${CYAN}  curl http://auth-service:3000/health${NC}"
    echo -e "${CYAN}  curl http://transaction-service:3000/health${NC}"
    echo -e "${CYAN}  curl http://settlement-service:3000/health${NC}"
    echo -e "${CYAN}  exit${NC}"
    kubectl run curl-test --image=curlimages/curl -i --tty --rm -n ${NAMESPACE} -- sh
    pause_for_screenshot

    print_subheader "2.3 - Logs com Variáveis de Ambiente"
    print_command "kubectl logs -n ${NAMESPACE} deployment/auth-service | grep -i \"dynamodb\\|redis\\|aws\""
    kubectl logs -n ${NAMESPACE} deployment/auth-service | grep -i "dynamodb\|redis\|aws" || echo "Nenhum log encontrado com esses filtros"
    
    print_command "kubectl logs -n ${NAMESPACE} deployment/transaction-service | grep -i \"dynamodb\\|redis\\|sns\""
    kubectl logs -n ${NAMESPACE} deployment/transaction-service | grep -i "dynamodb\|redis\|sns" || echo "Nenhum log encontrado com esses filtros"
    
    print_command "kubectl logs -n ${NAMESPACE} deployment/auth-service --tail=50"
    kubectl logs -n ${NAMESPACE} deployment/auth-service --tail=50
    pause_for_screenshot

    echo -e "${GREEN}✅ Etapa 2 concluída!${NC}"
}

#######################################################################
# ETAPA 3: KUBERNETES - ESTRUTURA, ESCALA E DEPLOY
#######################################################################
etapa3_kubernetes() {
    print_header "ETAPA 3: KUBERNETES - ESTRUTURA, ESCALA E DEPLOY (3,0 pts)"

    print_subheader "3.1 - Pods com 2 Réplicas"
    print_command "kubectl get pods -n ${NAMESPACE} -o wide"
    kubectl get pods -n ${NAMESPACE} -o wide
    pause_for_screenshot

    print_subheader "3.2 - Scaling de Deployments"
    print_command "kubectl scale deployment auth-service -n ${NAMESPACE} --replicas=4"
    kubectl scale deployment auth-service -n ${NAMESPACE} --replicas=4
    
    print_command "kubectl scale deployment transaction-service -n ${NAMESPACE} --replicas=4"
    kubectl scale deployment transaction-service -n ${NAMESPACE} --replicas=4
    
    print_command "kubectl scale deployment settlement-service -n ${NAMESPACE} --replicas=4"
    kubectl scale deployment settlement-service -n ${NAMESPACE} --replicas=4
    
    echo -e "${YELLOW}Aguardando pods escalarem...${NC}"
    sleep 15
    
    print_command "kubectl get pods -n ${NAMESPACE} -o wide"
    kubectl get pods -n ${NAMESPACE} -o wide
    pause_for_screenshot

    print_subheader "3.3 - Logs de Múltiplos Pods"
    echo -e "${YELLOW}Coletando logs de pods diferentes...${NC}"
    
    # Pegar nomes dos pods dinamicamente
    TRANSACTION_PODS=$(kubectl get pods -n ${NAMESPACE} -l app=transaction-service -o jsonpath='{.items[*].metadata.name}')
    SETTLEMENT_PODS=$(kubectl get pods -n ${NAMESPACE} -l app=settlement-service -o jsonpath='{.items[*].metadata.name}')
    
    for POD in $TRANSACTION_PODS; do
        print_command "kubectl logs -n ${NAMESPACE} ${POD} --tail=50"
        kubectl logs -n ${NAMESPACE} ${POD} --tail=50
        echo ""
    done
    pause_for_screenshot
    
    for POD in $SETTLEMENT_PODS; do
        print_command "kubectl logs -n ${NAMESPACE} ${POD} --tail=50"
        kubectl logs -n ${NAMESPACE} ${POD} --tail=50
        echo ""
    done
    pause_for_screenshot

    print_subheader "3.4 - CronJob Executado"
    
    # Deletar job anterior se existir
    kubectl delete job settlement-manual-test -n ${NAMESPACE} 2>/dev/null || true
    
    print_command "kubectl create job settlement-manual-test --from=cronjob/settlement-cronjob -n ${NAMESPACE}"
    kubectl create job settlement-manual-test --from=cronjob/settlement-cronjob -n ${NAMESPACE}
    
    echo -e "${YELLOW}Aguardando job executar...${NC}"
    sleep 10
    
    print_command "kubectl get jobs -n ${NAMESPACE}"
    kubectl get jobs -n ${NAMESPACE}
    
    print_command "kubectl describe cronjob settlement-cronjob -n ${NAMESPACE}"
    kubectl describe cronjob settlement-cronjob -n ${NAMESPACE}
    pause_for_screenshot

    # Voltar para 2 réplicas
    echo -e "${YELLOW}Voltando deployments para 2 réplicas...${NC}"
    kubectl scale deployment auth-service -n ${NAMESPACE} --replicas=2
    kubectl scale deployment transaction-service -n ${NAMESPACE} --replicas=2
    kubectl scale deployment settlement-service -n ${NAMESPACE} --replicas=2

    echo -e "${GREEN}✅ Etapa 3 concluída!${NC}"
}

#######################################################################
# ETAPA 4: SEGURANÇA, OBSERVAÇÃO E OPERAÇÃO
#######################################################################
etapa4_seguranca() {
    print_header "ETAPA 4: KUBERNETES - SEGURANÇA, OBSERVAÇÃO E OPERAÇÃO (2,0 pts)"

    print_subheader "4.1 - Limites de CPU/Memória"
    print_command "kubectl top pods -n ${NAMESPACE}"
    kubectl top pods -n ${NAMESPACE} 2>/dev/null || echo "Metrics server pode não estar instalado"
    
    print_command "kubectl describe pod -n ${NAMESPACE} -l app=auth-service | grep -A 10 \"Limits:\""
    kubectl describe pod -n ${NAMESPACE} -l app=auth-service | grep -A 10 "Limits:"
    pause_for_screenshot

    print_subheader "4.2 - SecurityContext Configurado"
    print_command "kubectl get deployment auth-service -n ${NAMESPACE} -o yaml | grep -A 10 securityContext"
    kubectl get deployment auth-service -n ${NAMESPACE} -o yaml | grep -A 10 securityContext
    
    print_command "kubectl get deployment transaction-service -n ${NAMESPACE} -o yaml | grep -A 10 securityContext"
    kubectl get deployment transaction-service -n ${NAMESPACE} -o yaml | grep -A 10 securityContext
    pause_for_screenshot

    print_subheader "4.3 - Pod Inseguro Bloqueado (vs Pod Seguro)"
    echo -e "${YELLOW}Aplicando deployment de teste inseguro...${NC}"
    
    # Deletar se já existir
    kubectl delete deployment insecure-test-deployment -n ${NAMESPACE} 2>/dev/null || true
    
    # Criar deployment inseguro inline
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: insecure-test-deployment
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: insecure-test
  template:
    metadata:
      labels:
        app: insecure-test
    spec:
      containers:
      - name: insecure-container
        image: nginx:latest
        securityContext:
          runAsUser: 0
          privileged: false
EOF

    echo -e "${YELLOW}Aguardando pod inseguro iniciar...${NC}"
    sleep 15
    
    print_command "kubectl get pods -n ${NAMESPACE} -l app=insecure-test"
    kubectl get pods -n ${NAMESPACE} -l app=insecure-test
    
    POD_INSECURE=$(kubectl get pods -n ${NAMESPACE} -l app=insecure-test -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    if [ -n "$POD_INSECURE" ]; then
        print_command "kubectl exec -n ${NAMESPACE} ${POD_INSECURE} -- whoami"
        kubectl exec -n ${NAMESPACE} ${POD_INSECURE} -- whoami || echo "Erro ao executar comando"
    fi
    
    POD_AUTH=$(kubectl get pods -n ${NAMESPACE} -l app=auth-service -o jsonpath='{.items[0].metadata.name}')
    print_command "kubectl exec -n ${NAMESPACE} ${POD_AUTH} -- id"
    kubectl exec -n ${NAMESPACE} ${POD_AUTH} -- id || echo "Erro ao executar comando"
    pause_for_screenshot

    print_subheader "4.4 - Permissões Restritas (RBAC)"
    print_command "kubectl auth can-i get pods --as=system:serviceaccount:${NAMESPACE}:auth-service -n ${NAMESPACE}"
    kubectl auth can-i get pods --as=system:serviceaccount:${NAMESPACE}:auth-service -n ${NAMESPACE}
    
    print_command "kubectl auth can-i delete pods --as=system:serviceaccount:${NAMESPACE}:auth-service -n ${NAMESPACE}"
    kubectl auth can-i delete pods --as=system:serviceaccount:${NAMESPACE}:auth-service -n ${NAMESPACE}
    
    print_command "kubectl auth can-i delete secrets --as=system:serviceaccount:${NAMESPACE}:auth-service -n ${NAMESPACE}"
    kubectl auth can-i delete secrets --as=system:serviceaccount:${NAMESPACE}:auth-service -n ${NAMESPACE}
    
    print_command "kubectl get rolebinding -n ${NAMESPACE}"
    kubectl get rolebinding -n ${NAMESPACE}
    
    print_command "kubectl get role microservices-role -n ${NAMESPACE} -o yaml"
    kubectl get role microservices-role -n ${NAMESPACE} -o yaml
    pause_for_screenshot

    # Cleanup
    echo -e "${YELLOW}Limpando deployment de teste...${NC}"
    kubectl delete deployment insecure-test-deployment -n ${NAMESPACE} 2>/dev/null || true

    echo -e "${GREEN}✅ Etapa 4 concluída!${NC}"
}

#######################################################################
# MENU PRINCIPAL
#######################################################################
show_menu() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║       PIX BANKING SYSTEM - COLETA DE EVIDÊNCIAS - RM555221              ║"
    echo "╠══════════════════════════════════════════════════════════════════════════╣"
    echo "║                                                                          ║"
    echo "║   1) Executar TODAS as etapas                                           ║"
    echo "║   2) Etapa 1 - Docker (Scan de Vulnerabilidades)                        ║"
    echo "║   3) Etapa 2 - Rede, Comunicação e Segmentação                          ║"
    echo "║   4) Etapa 3 - Kubernetes (Estrutura, Escala e Deploy)                  ║"
    echo "║   5) Etapa 4 - Segurança, Observação e Operação                         ║"
    echo "║   6) Verificar status dos pods                                          ║"
    echo "║   7) Aplicar apenas Network Policies                                    ║"
    echo "║   0) Sair                                                               ║"
    echo "║                                                                          ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -n "Escolha uma opção: "
}

check_pods() {
    print_header "STATUS DOS PODS"
    print_command "kubectl get all -n ${NAMESPACE}"
    kubectl get all -n ${NAMESPACE}
    pause_for_screenshot
}

apply_network_policies() {
    print_header "APLICANDO NETWORK POLICIES"
    
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service-netpol
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: pix-microservices
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 6379
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: transaction-service-netpol
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: transaction-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: pix-microservices
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 6379
    - protocol: TCP
      port: 3000
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: settlement-service-netpol
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: settlement-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: pix-microservices
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
EOF

    echo -e "${GREEN}✅ Network Policies aplicadas!${NC}"
    
    print_command "kubectl get networkpolicy -n ${NAMESPACE}"
    kubectl get networkpolicy -n ${NAMESPACE}
    pause_for_screenshot
}

run_all() {
    etapa1_docker
    etapa2_rede
    etapa3_kubernetes
    etapa4_seguranca
    
    print_header "🎉 TODAS AS EVIDÊNCIAS COLETADAS COM SUCESSO!"
    echo -e "${GREEN}Parabéns! Você coletou todas as evidências necessárias.${NC}"
}

#######################################################################
# MAIN
#######################################################################
main() {
    while true; do
        show_menu
        read -r choice
        case $choice in
            1) run_all ;;
            2) etapa1_docker ;;
            3) etapa2_rede ;;
            4) etapa3_kubernetes ;;
            5) etapa4_seguranca ;;
            6) check_pods ;;
            7) apply_network_policies ;;
            0) 
                echo -e "${GREEN}Até mais! 👋${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Opção inválida!${NC}"
                sleep 1
                ;;
        esac
    done
}

# Verificar se kubectl está configurado
echo -e "${YELLOW}Verificando conexão com o cluster...${NC}"
if ! kubectl cluster-info &>/dev/null; then
    echo -e "${RED}❌ Erro: kubectl não está configurado ou cluster não está acessível${NC}"
    echo -e "${YELLOW}Execute: aws eks update-kubeconfig --region us-east-1 --name pix-banking-system-dev-eks${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conectado ao cluster!${NC}"
sleep 1

main