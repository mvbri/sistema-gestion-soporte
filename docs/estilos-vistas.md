# Guía de estilos para vistas

Documento de referencia para aplicar de forma consistente el diseño del sistema. Usa las clases globales definidas en `client/src/styles/index.css` y los patrones ya probados en las vistas de referencia.

**Objetivo:** que cualquier vista nueva se vea “de la misma app” sin reinventar layouts, grids, inputs, estados ni acciones.

## Cómo elegir qué aplicar

No todas las vistas necesitan todo. Elige según lo que tenga la pantalla:

| Elemento en la vista | Estilo a usar | Referencia |
|----------------------|---------------|------------|
| Listado / tabla de registros | **Perfil Lista (Tickets)** | `TicketsList.tsx`, `AdminUsers.tsx` |
| Bloque de filtros arriba del listado | **Perfil Lista (Tickets)** | `TicketsList.tsx` |
| Formulario (creación/edición) que NO es “solicitud” | **Perfil Formulario (Tickets)** | `CreateLoanRequest.tsx` |
| Formulario de creación/edición de solicitudes | **Perfil Solicitudes** | `CreateMaterialRequest.tsx` |
| Listado de solicitudes (materiales, etc.) | Filtros y contenedor **Solicitudes**; si quieres filas claras como tickets, ver nota al final | `MaterialRequestsList.tsx` |
| Solo detalle, dashboard o modal sin lista ni filtros | Encabezado + `card` / `content-panel` según contenido | Secciones “Base” más abajo |
| Grid de ítems de inventario (equipos, herramientas, consumibles) | **Perfil Inventario (cards)** | `EquipmentCard.tsx`, `ToolCard.tsx`, `ConsumableCard.tsx` |
| `<table>` HTML clásica | Envolver con `tickets-list-light` | `AdminUsers.tsx` |

```
¿Tiene filtros de búsqueda?
  └─ Sí → Perfil Lista: content-panel + label-field + input-field
¿Muestra filas de datos (lista o tabla)?
  └─ Sí → Perfil Lista: card + tickets-list-light (ul o table)
¿Es formulario de solicitud / flujo “solicitudes”?
  └─ Sí → Perfil Solicitudes: card + input-dark + forms.module.css
¿Solo contenido informativo?
  └─ Base: PageWrapper + page-heading + card o content-panel
```

---

## Requisitos en toda vista

1. Envolver el contenido en `PageWrapper` (activa `app-shell` y el fondo degradado).
2. Usar `MainNavbar` en la parte superior, como en el resto de la app.
3. Contenedor de página acotado, por ejemplo:

```tsx
<div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
  <div className="py-4 sm:py-6">
    {/* contenido */}
  </div>
</div>
```

Para formularios de solicitudes, el ancho habitual es `max-w-3xl` (ver `CreateMaterialRequest.tsx`).

### Reglas rápidas de layout (consistencia)

- **Ancho estándar**:
  - Listados/dashboards: `max-w-7xl`
  - Formularios (tickets/solicitudes): `max-w-3xl` (o `max-w-4xl` si hay 2 columnas)
- **Separación vertical**:
  - Encabezado → contenido: `mb-6`
  - Secciones internas: `space-y-6` o `space-y-8` dentro de `card`
- **Grid**:
  - Campos: `grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5`
  - Filtros grandes (4 columnas): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## Clases globales (`index.css`)

Importadas automáticamente vía `index.css`. No hace falta importarlas en cada componente.

| Clase | Uso |
|-------|-----|
| `app-shell` | Fondo de aplicación (lo aplica `PageWrapper`) |
| `page-heading` | Título principal de página |
| `page-subheading` | Subtítulo / ayuda bajo el título |
| `content-panel` | Panel oscuro con borde sky (filtros, secciones secundarias) |
| `card` | Tarjeta principal glassmorphism |
| `stat-card` | Métricas en dashboard |
| `label-field` | Etiqueta de campo |
| `input-field` | Input/select en paneles de filtros (tickets) |
| `input-dark` | Input/select en formularios de solicitudes |
| `btn-primary` | Acción principal |
| `btn-secondary` | Secundaria / limpiar / paginación |
| `btn-warning` | Editar (icono) |
| `btn-danger` | Eliminar (icono) |
| `tickets-list-light` | Contenedor de lista/tabla con texto gris oscuro sobre fondo claro |

Módulo opcional para formularios:

```tsx
import formStyles from '../styles/modules/forms.module.css';
```

| Export en `forms.module.css` | Uso |
|------------------------------|-----|
| `formGroup` | Espaciado entre campos (`!mb-0` si va en grid) |
| `selectField` | Chevron en `<select>` junto con `input-dark` |
| `inputError` | Borde rojo en validación |
| `errorAlert` / `successMessage` | Mensajes de estado |

### Convenciones (para que todo “calce”)

- **Labels siempre visibles**: `label-field` con `htmlFor` y `id` (evitar placeholders como label).
- **Ayuda debajo del label**: `text-xs text-blue-100/70` (si aplica).
- **Indicador requerido**:
  - Asterisco visible: `text-red-300/90` con `aria-hidden`
  - El input debe ser `required` o validado en submit
- **Acciones**:
  - Una primaria por sección.
  - Secundarias con `btn-secondary`.
  - Icon-buttons: `btn-warning` / `btn-danger` o gradientes específicos si ya existen en la vista.

---

## Perfil Lista (vista de Tickets)

**Referencias:** `client/src/pages/TicketsList.tsx`, `client/src/pages/AdminUsers.tsx`

### Encabezado de página

```tsx
<header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
  <div>
    <h1 className="page-heading">Título de la vista</h1>
    <p className="page-subheading">Texto de ayuda opcional.</p>
  </div>
  <button type="button" className="btn-primary text-sm sm:text-base whitespace-nowrap">
    Acción principal
  </button>
</header>
```

### Sección de filtros

Patrón obligatorio para cualquier vista con filtros al estilo tickets:

- Contenedor: `content-panel mb-6`
- Título: icono embudo (`text-sky-300`) + “Filtros de Búsqueda”
- Botón limpiar: `btn-secondary` + `ClearFiltersIcon`
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5`
- Cada filtro: `label-field flex items-center gap-2 !mb-2` + icono de color + `input-field`
- Búsqueda con botón: input `rounded-l-xl rounded-r-none border-r-0` + botón `btn-primary rounded-l-none rounded-r-xl`

```tsx
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';

<div className="content-panel mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
    <div className="flex items-center gap-2">
      {/* SVG embudo, className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" */}
      <h2 className="text-lg sm:text-xl font-semibold text-white">Filtros de Búsqueda</h2>
    </div>
    <button
      type="button"
      onClick={handleClearFilters}
      className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
    >
      <ClearFiltersIcon className="w-4 h-4" />
      <span>Limpiar</span>
    </button>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
    <div className="min-w-0">
      <label className="label-field flex items-center gap-2 !mb-2">
        {/* icono */}
        <span>Buscar</span>
      </label>
      <div className="flex min-w-0 shadow-sm">
        <input className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0" />
        <button type="button" className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0">
          {/* icono lupa */}
        </button>
      </div>
    </div>
    {/* más columnas: select con input-field + chevron absoluto a la derecha */}
  </div>
</div>
```

**Select con chevron:** envolver en `relative`, `select` con `input-field w-full py-2.5 pr-10 appearance-none cursor-pointer`, chevron en `absolute inset-y-0 right-0 … pointer-events-none`.

**Colores sugeridos para iconos de filtro** (como en tickets):

| Filtro | Clase icono |
|--------|-------------|
| Buscar | `text-sky-300` |
| Estado | `text-emerald-300` |
| Categoría | `text-violet-300` |
| Prioridad | `text-amber-300` |
| Persona / técnico | `text-indigo-300` |

### Lista tipo tarjetas (preferido para listados)

No usar tabla HTML si basta una lista; es el patrón principal de tickets.

```tsx
<div className="card !p-0 overflow-hidden">
  <ul className="tickets-list-light divide-y divide-gray-200 bg-white/95">
  {items.map((item) => (
    <li
      key={item.id}
      className="px-4 sm:px-6 py-4 hover:bg-sky-50/90 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {item.title}
            </p>
            {/* badges: StatusBadge, PriorityBadge, CategoryBadge */}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span>ID: …</span>
            <span>Creado: …</span>
            <span>Por: …</span>
          </div>
        </div>
        <div className="flex items-center justify-end flex-wrap gap-2 flex-shrink-0">
          {/* acciones — ver abajo */}
        </div>
      </div>
    </li>
  ))}
  </ul>
</div>
```

**Importante:** la clase `tickets-list-light` en un ancestro hace que `text-gray-*` se vean oscuros sobre el fondo blanco, aunque la página use `app-shell`.

### Tabla HTML (`<table>`)

Cuando necesites columnas fijas, envuelve la tabla:

```tsx
<div className="card !p-0 overflow-hidden">
  <div className="tickets-list-light overflow-x-auto bg-white/95">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
            Columna
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">…</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Acciones por fila (lista tickets)

| Acción | Clases |
|--------|--------|
| Ver | `px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-blue-600 hover:to-blue-700 …` |
| Editar (icono) | `p-2 sm:p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md …` |
| Eliminar (icono) | `p-2 sm:p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md …` |
| Marcar resuelto | Gradiente verde `from-green-500 to-green-600` |

Alternativa global: `btn-primary`, `btn-warning`, `btn-danger` donde encaje mejor.

### Badges en listas

Reutilizar componentes existentes:

- `StatusBadge`, `PriorityBadge`, `CategoryBadge` → tickets
- `MaterialRequestStatusBadge` → solicitudes de materiales

### Estados vacío y carga (lista)

```tsx
{/* Cargando */}
<div className="card py-12 text-center">
  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
  <p className="mt-3 text-blue-100/85">Cargando…</p>
</div>

{/* Sin resultados */}
<div className="card py-12 text-center">
  <p className="text-blue-100/80">No se encontraron registros.</p>
</div>
```

### Paginación (lista tickets)

```tsx
<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
  <div className="text-xs sm:text-sm text-blue-50/90">
    Mostrando X a Y de Z
  </div>
  <div className="flex gap-2">
    <button type="button" className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50">
      Anterior
    </button>
    <button type="button" className="btn-secondary …">Siguiente</button>
  </div>
</div>
```

---

## Perfil Formulario (estilo Tickets)

Usa este perfil para formularios tipo “Crear/Editar Ticket” (panel oscuro con campos), sin el look “solicitud” de `input-dark`.

**Referencia sugerida:** `client/src/pages/CreateLoanRequest.tsx` (estructura de formulario similar).

### Estructura recomendada (encabezado + card)

```tsx
<div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
  <header className="mb-6">
    <h1 className="page-heading">Crear Nuevo Ticket</h1>
    <p className="page-subheading">Completa la información para registrar el incidente.</p>
  </header>

  <div className="card !p-0 overflow-hidden">
    <div className="content-panel !mb-0 !rounded-none !border-0 !p-5 sm:!p-6">
      {/* campos */}
    </div>
  </div>
</div>
```

Notas:

- `card !p-0` mantiene el contenedor glassmorphism externo; `content-panel` da el panel oscuro “legible” para inputs.
- Si no necesitas panel interno, puedes poner directamente campos dentro de `card` con `!p-5 sm:!p-8`.

### Campos (input-field en panel oscuro)

```tsx
<div className="mb-5">
  <label htmlFor="title" className="label-field">
    Título <span className="text-red-300/90" aria-hidden> *</span>
  </label>
  <input id="title" className="input-field" />
  <p className="mt-1.5 text-xs text-rose-200/85">Este campo es obligatorio.</p>
</div>
```

Textarea:

```tsx
<textarea className="input-field resize-y min-h-[9rem]" />
```

### Sección “selector” (ej. falla frecuente)

Para selects grandes con ayuda debajo:

```tsx
<div className="mb-6">
  <label className="label-field flex items-center gap-2 !mb-2">
    <span>
      Falla frecuente <span className="font-normal text-blue-100/50">(opcional)</span>
    </span>
  </label>
  <select className="input-field w-full py-2.5 pr-10 appearance-none cursor-pointer" />
  <p className="mt-2 text-xs text-blue-100/70">
    Al elegir una plantilla se completa el título y la descripción; la solución se muestra aparte.
  </p>
</div>
```

### Acciones del formulario

```tsx
<footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
  <button type="button" className="btn-secondary w-full sm:w-auto">Cancelar</button>
  <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-[10rem]">
    Guardar
  </button>
</footer>
```

### Estados (carga / error / disabled)

- **Cargando submit**: deshabilitar botón primario y mostrar “Guardando…”.
- **Campos disabled**: preferir `disabled:opacity-60 disabled:cursor-not-allowed` (si hace falta, añadirlo en el componente/clase puntual).
- **Error general**: arriba del formulario, dentro del panel:

```tsx
<div className="mb-5 rounded-xl border border-rose-400/25 bg-rose-950/25 px-4 py-3 text-sm text-rose-100">
  No se pudo guardar. Intenta de nuevo.
</div>
```

---

## Perfil Solicitudes (Nueva solicitud de materiales)

**Referencias:** `client/src/pages/CreateMaterialRequest.tsx`, `client/src/pages/MaterialRequestsList.tsx`

Usar este perfil para:

- Crear / editar solicitudes (materiales u otros módulos “solicitud”)
- Pantallas con formulario oscuro integrado en `card`
- Subsecciones internas (ítems, materiales agregados)

### Estructura de página

```tsx
<div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
  <header className="mb-5 sm:mb-6">
    <h1 className="page-heading">Nueva solicitud de …</h1>
    <p className="page-subheading">Descripción breve del flujo.</p>
  </header>

  <form className="card space-y-6 sm:space-y-8 !p-5 sm:!p-8">
    {/* secciones */}
  </form>
</div>
```

### Campos de formulario

```tsx
<div className={formStyles.formGroup}>
  <label htmlFor="campo-id" className="label-field">
    Etiqueta
    <span className="text-red-300/90" aria-hidden> *</span>
  </label>
  <p className="mb-2 text-xs text-blue-100/70">Texto de ayuda opcional.</p>
  <input id="campo-id" className="input-dark" />
  <p className="mt-1.5 text-xs text-amber-200/80">Contador o validación</p>
</div>
```

- Requerido: asterisco `text-red-300/90`
- Opcional: `<span className="font-normal text-blue-100/50"> (opcional)</span>`
- Textarea: `input-dark resize-y min-h-[7rem]`
- Select: `className={`input-dark ${formStyles.selectField}`}`
- Fecha: `input-dark py-2.5 [color-scheme:dark]`
- Grid de dos columnas: `grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5`

### Subsección dentro del formulario (ej. materiales)

```tsx
<section className="content-panel !mb-0 space-y-4 !p-4 sm:!p-5">
  <div className="flex flex-wrap items-baseline justify-between gap-2">
    <h2 className="text-base font-semibold text-white sm:text-lg">Título sección</h2>
    <span className="text-xs text-sky-200/70 tabular-nums">0 ítem(s)</span>
  </div>
  {/* campos o lista interna */}
</section>
```

### Lista interna oscura (ítems agregados)

```tsx
<ul className="divide-y divide-sky-400/20 rounded-xl border border-sky-400/25 overflow-hidden">
  <li className="flex gap-3 px-3 py-3 sm:px-4 sm:py-3.5 bg-slate-900/30">
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-white">Título ítem</p>
      <p className="mt-0.5 text-xs text-blue-100/65">Metadatos · Cant. 1</p>
    </div>
    {/* botón quitar */}
  </li>
</ul>
```

### Pie de formulario

```tsx
<footer className="flex flex-col-reverse gap-3 border-t border-sky-400/20 pt-5 sm:flex-row sm:justify-end sm:gap-3">
  <button type="button" className="btn-secondary w-full sm:w-auto">Cancelar</button>
  <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-[10rem]">
    Enviar
  </button>
</footer>
```

### Listado de solicitudes (`MaterialRequestsList`)

Combina contenedor **Solicitudes** (`card` único con filtros + lista) con:

- Filtros dentro del `card`, sin `content-panel` separado
- Título de sección: `text-base font-semibold text-white sm:text-lg`
- Inputs: `input-dark` (no `input-field`)
- Lista: filas oscuras `bg-slate-900/30`, borde `border-sky-400/25` (no `tickets-list-light`)
- Acciones: iconos con `rounded-lg p-2` y colores `text-sky-300`, `text-emerald-300`, `text-rose-300`

Si un listado de solicitudes debe verse **igual que tickets** (filas blancas), usa el Perfil Lista para la tabla/lista y mantén `input-dark` solo en formularios.

### Evitar mezcla de inputs (regla práctica)

- En la **misma pantalla**, no mezcles `input-field` y `input-dark` salvo que haya una razón clara:
  - Filtros de búsqueda estilo tickets → `input-field`
  - Formulario tipo solicitud → `input-dark`
  - Formulario tipo ticket (panel) → `input-field`

### Contador de caracteres (validación)

```tsx
<p
  className={`mt-1.5 text-xs tabular-nums ${
    length >= min ? 'text-sky-200/60' : 'text-amber-200/80'
  }`}
>
  {length} / {min} caracteres mínimos
</p>
```

### Stepper de cantidad (opcional)

Ver `QuantityStepper` en `CreateMaterialRequest.tsx`: borde `border-sky-300/45`, fondo `bg-slate-900/65`, `focus-within:ring-sky-400`.

---

## Vistas sin tabla ni filtros

Aplica solo lo que corresponda:

1. `PageWrapper` + `MainNavbar`
2. `page-heading` / `page-subheading`
3. Contenido en `card` (formulario o detalle) o `content-panel` (bloques informativos)
4. Botones: `btn-primary` / `btn-secondary`
5. Si hay campos sueltos en panel oscuro: `label-field` + `input-field` o `input-dark` según contexto (filtro → `input-field`, formulario solicitud → `input-dark`)

Ignora las secciones de filtros, `tickets-list-light` y paginación de lista.

---

## Accesibilidad y UX (mínimos)

- **Label + id**: todo input debe tener `label htmlFor` y un `id` único.
- **Mensajes de error**:
  - Mostrar debajo del campo, `text-xs` y color cálido (ámbar/rose).
  - Si puedes, enlazar con `aria-describedby` al mensaje.
- **Botones**:
  - `type="button"` en botones que NO envían formularios.
  - En acciones destructivas, pedir confirmación.
- **Responsive**:
  - Evitar anchos fijos; usar `min-w-0` y `truncate` en textos largos.
  - Acciones en filas: `flex-wrap gap-2` y `justify-end` para que no rompan.

---

## Checklist rápido al crear una vista

- [ ] `MainNavbar` + `PageWrapper`
- [ ] Título con `page-heading` y subtítulo si aplica
- [ ] **Con filtros:** `content-panel`, título “Filtros de Búsqueda”, `ClearFiltersIcon`, grid responsive, `input-field`
- [ ] **Con listado:** `card !p-0` + `tickets-list-light` + filas con `text-gray-900` / `text-gray-600`
- [ ] **Con `<table>`:** envoltorio `tickets-list-light` + thead gris claro
- [ ] **Formulario solicitud:** `card` + `input-dark` + `formStyles.formGroup`
- [ ] **Formulario ticket:** `card !p-0` + `content-panel` + `input-field` + footer con acciones
- [ ] Paginación con `btn-secondary` y texto `text-blue-50/90` o `text-blue-100/75`
- [ ] Estados de carga/vacío coherentes con la referencia del perfil elegido

---

## Archivos de referencia

| Archivo | Qué copiar |
|---------|------------|
| `client/src/styles/index.css` | Definición de todas las clases `@layer components` |
| `client/src/styles/modules/forms.module.css` | Select, errores, grupos |
| `client/src/pages/TicketsList.tsx` | Filtros + lista clara + acciones + paginación |
| `client/src/pages/AdminUsers.tsx` | Filtros + tabla HTML en `tickets-list-light` |
| `client/src/pages/CreateMaterialRequest.tsx` | Formulario solicitud completo |
| `client/src/pages/MaterialRequestsList.tsx` | Listado solicitudes con filtros integrados |
| `client/src/components/PageWrapper.tsx` | Shell de página |
| `client/src/components/icons/ClearFiltersIcon.tsx` | Icono limpiar filtros |

---

## Evitar (estilos legacy)

Al migrar vistas antiguas, reemplazar patrones como:

- Filtros con `bg-white`, `text-gray-800` y bordes grises (`ToolFilters.tsx` y similares)
- Listas sin `tickets-list-light` que hereden colores claros del `app-shell`
- Tablas sin envoltorio `tickets-list-light` (texto ilegible sobre fondo oscuro)

---

## Resumen de nombres (“cómo llamar al estilo”)

| Nombre informal | Perfil | Clases clave |
|-----------------|--------|--------------|
| **Estilo tickets** / **lista** | Perfil Lista | `content-panel`, `input-field`, `tickets-list-light`, `card !p-0` |
| **Estilo tickets** / **formulario** | Perfil Formulario (Tickets) | `card !p-0`, `content-panel`, `input-field` |
| **Estilo solicitudes** / **formulario** | Perfil Solicitudes | `card`, `input-dark`, `formStyles`, `content-panel` anidado |
| **Solo layout** | Base | `page-heading`, `card` o `content-panel`, botones globales |
| **Inventario** / **cards de ítem** | Perfil Inventario (cards) | `InventoryCardShell`, `InventoryMetaRow`, `info-tile` |

Al implementar una vista nueva, indica en el PR o en comentarios: *“UI: estilo tickets (filtros + lista)”* o *“UI: estilo solicitudes (formulario)”* para alinear expectativas con esta guía.

---

## Perfil Inventario (cards de ítem)

**Referencias:** `EquipmentList.tsx`, `ToolsList.tsx`, `ConsumablesList.tsx`  
**Componentes compartidos:** `client/src/components/inventory/`

Usar este perfil para grids de **equipos**, **herramientas** y **consumibles**. No uses tarjetas blancas (`bg-white`) sobre `PageWrapper`.

### Cuándo aplicarlo

- Listado en grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- Cada ítem es una card independiente con nombre, badges de estado/tipo, acciones Ver/Eliminar y filas de metadatos

### Estructura de la card

Envolver con `InventoryCardShell`:

```tsx
import { InventoryCardShell, InventoryCardAlert } from '../components/inventory/InventoryCardShell';
import { InventoryMetaRow } from '../components/inventory/InventoryMetaRow';
import { InventoryTypeBadge } from '../components/inventory/InventoryTypeBadge';

<InventoryCardShell
  title={item.name}
  itemLabel="equipo" // o "herramienta" | "consumible"
  canEdit={canEdit}
  canDelete={canDelete}
  onView={() => navigate(`/equipment/${item.id}`)}
  onDelete={() => onDelete(item.id, item.name)}
  badges={
    <>
      <StatusBadge status={item.status} />
      {item.type_name ? <InventoryTypeBadge type={item.type_name} /> : null}
    </>
  }
>
  {/* filas y alertas */}
</InventoryCardShell>
```

### Filas de metadatos (`InventoryMetaRow`)

Patrón único para todas las propiedades (marca, código, cantidad, ubicación, etc.):

```tsx
<InventoryMetaRow label="Código" value={tool.code} mono />
<InventoryMetaRow label="Cantidad" value={`${qty} ${unit}`} valueClassName="text-amber-300" />
```

- Usa `info-tile` por dentro (definido en `index.css`)
- Etiqueta: mayúsculas, `text-blue-100/60`
- Valor: `text-blue-50`, alineado a la derecha
- `mono` para códigos y series

### Alertas dentro de la card (`InventoryCardAlert`)

Para estados que requieren atención (no mezclar con filas normales):

| Caso | Variante | Ejemplo |
|------|----------|---------|
| Préstamo activo (equipo) | `rose` | En préstamo + solicitante |
| Stock bajo (consumible) | `amber` | Mínimo vs cantidad actual |

```tsx
<InventoryCardAlert variant="rose" label="En préstamo" value={requesterName} />
<InventoryCardAlert variant="amber" label="Stock bajo" value={`Mínimo: ${min} ${unit}`} />
```

### Acciones (iconos)

- **Ver:** icono ojo, borde sky, `text-sky-300` → hover fondo sky
- **Eliminar:** icono papelera, borde rose, `text-rose-300` → hover fondo rose  
  (definidas en `InventoryCardShell`; no botones de texto azul/rojo sobre fondo oscuro)

### Badges de estado y tipo

- Estado: componentes `StatusBadge` / `ToolStatusBadge` / `ConsumableStatusBadge` con fondos claros (`bg-*-100`) y texto oscuro (`text-*-950`)
- Tipo: `InventoryTypeBadge` (violeta) o `TypeBadge` en equipos (reexporta el mismo estilo)

### Descripción larga (consumibles)

Opcional al final de la card:

```tsx
<div className="content-panel content-panel--violet !mb-0 !p-3 mt-1">
  <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1.5">Descripción</p>
  <p className="text-sm text-blue-100/90 leading-relaxed break-words">{description}</p>
</div>
```

### Checklist card de inventario

- [ ] `InventoryCardShell` + `card` (no `bg-white`)
- [ ] Header con borde inferior `border-sky-400/20`
- [ ] Badges claros sobre fondo oscuro
- [ ] Metadatos con `InventoryMetaRow` (mismo estilo en todas las filas)
- [ ] Alertas con `InventoryCardAlert` (rose/amber), no filas rosas/blancas sueltas
- [ ] Grid de página: `page-heading` + filtros en `content-panel` + `input-field`

---

## Cards de métricas (estilo Gestión de Usuarios)

**Referencia:** `client/src/pages/AdminUsers.tsx` (bloque de tarjetas: “Total Usuarios”, “Usuarios Activos”, etc.)

Usa este estilo cuando una vista muestre **métricas resumidas** (contadores) encima de una lista o reporte.

- Contenedor: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6`
- Card base: `stat-card` + variante de color (`stat-card--sky`, `stat-card--emerald`, `stat-card--amber`, `stat-card--violet`)
- Contenido interno: `flex items-center justify-between gap-3`
- Textos:
  - Título: `stat-card-title`
  - Valor: `stat-card-value`
- Icono: contenedor `stat-card-icon` + variante (`stat-card-icon--sky`, etc.) con un SVG de 24px (`w-6 h-6`)

Ejemplo:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div className="stat-card stat-card--sky">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="stat-card-title">Total</p>
        <p className="stat-card-value">123</p>
      </div>
      <div className="stat-card-icon stat-card-icon--sky">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
        </svg>
      </div>
    </div>
  </div>
</div>
```

Notas:

- Si una vista ya usa `stat-card` pero “se ve diferente”, revisar que esté usando **título/valor/icono** como arriba (no `text-gray-*` ni tarjetas blancas).
