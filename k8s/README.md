# Despliegue con Kubernetes + ArgoCD

## Estructura

```
k8s/
├── namespace.yaml          # Namespace "gymtracker"
├── secrets.example.yaml    # Plantilla de Secret (no aplicar tal cual)
├── deployment.yaml         # App Node.js (2 réplicas)
├── mongodb.yaml            # MongoDB 6 + PVC + Service interno
├── service.yaml            # NodePort para exponer la API
└── argocd/
    ├── project.yaml        # AppProject de ArgoCD
    └── application.yaml    # Application de ArgoCD (apunta a main/k8s/)
```

## Requisitos previos

- Cluster Kubernetes accesible (`kubectl cluster-info`)
- ArgoCD instalado en el namespace `argocd`
- Acceso para crear recursos en el namespace `gymtracker`

## Paso 1 — Crear el namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

## Paso 2 — Crear el Secret con los valores reales

Los Secrets **no se gestionan con ArgoCD** para evitar commitear valores sensibles.
Créalos manualmente una sola vez:

```bash
kubectl create secret generic gymtracker-secrets \
  --namespace gymtracker \
  --from-literal=SECRET_JWT_KEY='<tu-clave-jwt>' \
  --from-literal=USDA_API_KEY='<tu-api-key-usda>' \
  --from-literal=MONGO_URI='mongodb://gymtracker-mongodb:27017/gymtracker'
```

> Sustituye `<tu-clave-jwt>` y `<tu-api-key-usda>` por los valores reales.
> El USDA_API_KEY actual está en el fichero `.env` del repo (no lo subas).

Para verificar que se creó correctamente:

```bash
kubectl get secret gymtracker-secrets -n gymtracker
```

## Paso 3 — Bootstrapping de ArgoCD (una sola vez)

Aplica el AppProject y la Application manualmente. A partir de aquí ArgoCD se encarga del resto.

```bash
kubectl apply -f k8s/argocd/project.yaml
kubectl apply -f k8s/argocd/application.yaml
```

ArgoCD detectará automáticamente los manifiestos en `k8s/` (excluyendo `argocd/` y `*.example.yaml`) y los sincronizará contra el cluster.

## Paso 4 — Verificar el despliegue

```bash
# Estado de la Application en ArgoCD
kubectl get application gymtracker-back -n argocd

# Pods en el namespace gymtracker
kubectl get pods -n gymtracker

# Logs de la app
kubectl logs -l app=gymtracker-back -n gymtracker --tail=50
```

## Flujo de CD (GitOps)

Cada vez que Jenkins construye y publica una nueva imagen:

1. Jenkins actualiza el tag de imagen en `k8s/deployment.yaml`:
   ```
   image: santa2005/gymtracker-back:<nuevo-tag>
   ```
2. Hace commit y push a la rama `main`.
3. ArgoCD detecta el cambio (polling cada 3 min o via webhook) y sincroniza.

Para configurar un webhook de GitHub → ArgoCD y reducir la latencia:
- En GitHub: `Settings > Webhooks > Add webhook`
- URL: `https://<argocd-server>/api/webhook`
- Content type: `application/json`
- Secret: el webhook secret de ArgoCD

## Actualización manual de imagen (sin CI)

```bash
kubectl set image deployment/gymtracker-back \
  gymtracker-back=santa2005/gymtracker-back:<nuevo-tag> \
  -n gymtracker
```

> Nota: ArgoCD revertirá este cambio en el siguiente sync si `selfHeal: true` está activo.
> Lo correcto es actualizar el YAML y hacer commit.

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Pod en `CrashLoopBackOff` | Secret no creado o clave incorrecta | `kubectl describe pod <pod> -n gymtracker` |
| ArgoCD en `OutOfSync` permanente | Recursos fuera del whitelist del AppProject | Revisar `project.yaml` |
| MongoDB no arranca | PVC no disponible en el cluster | Verificar StorageClass disponible |
| `/health` devuelve 502 | App aún inicializando | Esperar `initialDelaySeconds` (15s) |
