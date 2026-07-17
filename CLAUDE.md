# Cooprinsem — Registro de Transportistas

Digitalización del Protocolo de Ingreso de Transportistas del CPHS de Cooprinsem (sucursal Manuel Rodríguez 1040, Osorno). Monorepo:

- `backend/` — API REST NestJS 11 + TypeORM 0.3 + MySQL (`cooprinsem_transportistas`). Puerto 3002.
- `frontend/` — React 19 + Vite + TanStack Router (file-based) / Query / Table + Shadcn-style + Tailwind v4 + Zustand + RHF/Zod. Puerto 5175.

## Comandos

- Backend: `cd backend; npm run start:dev` (dev), `npm run seed` (poblar admin/catálogos/config).
- Frontend: `cd frontend; npm run dev`.
- MySQL local: root sin contraseña, binario en `C:\mysql\mysql-8.0.41-winx64\bin\mysql.exe`.

## Dominio

Portería/patio registra **ingresos y salidas** de camiones (formulario del protocolo: fecha, horas, conductor, empresa, patente, motivo, área responsable, checklist EPP/condición apta). Bodega/Abastecimiento crea **avisos previos** de camiones (con tonelaje y flag de supervisión, ej. descarga de Nitrógeno INDURA); portería los vincula al ingreso. Las **incidencias** dan trazabilidad por empresa/conductor. Vista de solo lectura del **protocolo** completo.

Roles: `admin` (todo), `porteria` (registros, incidencias, avisos), `solicitante` (avisos y consulta).

## Convenciones

- Catálogos configurables en `opcion_catalogo` (motivo_visita, area_responsable, tipo_incidencia) + tabla `configuracion` key-value. Estados de aviso y severidades son enums en código.
- Backend: DTOs con class-validator en todo input, guards JWT+Roles globales, módulos por feature. Patrón heredado de Livanto/Oxxean.
- Frontend: rutas file-based en `src/routes/`, data fetching solo con TanStack Query, formularios RHF+Zod, tema verde Cooprinsem (sidebar `forest`, acento `brand`).

## Deploy QA

Push a `main` → `.github/workflows/deploy-qa.yml` compila y sube por FTPS al hosting cPanel/CloudLinux de patagonianet: backend a `cooprinsem-api/` (Passenger, node_modules se instalan vía selector CloudLinux), frontend a `public_html/cooprinsem.patagonianet.cl/`. Secrets del repo: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
