# JBG Drivers — app cliente para conductores

TanStack Start (React 19, SSR, file-based routing) + TanStack Query + Tailwind v4 + zod.
Gestor de paquetes: **pnpm**. Dev en puerto **3001** (el backend ocupa el 3000).

## Convenciones

- Alias de imports: `#/*` → `src/*` (también `@/*` en tsconfig, usar `#/`).
- Capas: `domain/` (esquemas zod) → `services/` (repositorios HTTP) → `hooks/` (React Query) → `routes/` + `components/` (UI).
- Cliente HTTP: `src/lib/http.ts` — `apiFetch()` agrega `Authorization: Bearer` desde `tokenStorage` (localStorage, clave `drivers.token`). 401 limpia el token.
- UI en español, mobile-first (los conductores usan teléfono).
- Componentes shadcn-style en `src/components/ui/` (estilo new-york, ver `components.json`).

## Auth

- `POST /login` → `{ token }` (JWT). El backend identifica al conductor por el token; nunca enviar userId/driverId desde el cliente.
- Guard de sesión en `src/routes/_authed.tsx` (`beforeLoad`, solo client-side porque el token vive en localStorage).
- Solo usuarios con `type: DRIVER` pasan las policies del backend (`isUserType("DRIVER")`).

## Endpoints del conductor (back-jbg-logistica)

- `GET /driver/me/route/active` — ruta PLANNED/ACTIVE asignada (responde `200` con `null` si no hay ruta)
- `POST /route/:routeId/start` — sin body, responde 204
- `POST /route/:routeId/stop/:stopId/attempt` — **JSON**: `outcome` (DELIVERED|FAILED), `photo` (data URL base64 — el backend lo decodifica y guarda vía MediaStorage), `gpsLat`, `gpsLng`, `clientTimestamp` (ISO, máx. 24h de antigüedad), `reason?` — máx. 3 intentos por parada
- `POST /route/:routeId/complete` — sin body, responde 204

## Pendiente

- **Historial de rutas**: no existe endpoint driver-scoped en el backend.
  `POST /route/find` exige `CAN_LIST_SHIPMENTS` (admin). Ver TODO en
  `src/routes/_authed/history.tsx` y `src/services/routeRepository.ts`.

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
