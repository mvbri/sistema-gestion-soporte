# Diagrama de Entidad-Relación (ER)

Diagrama de la base de datos del Sistema de Gestión de Soporte Técnico.

```mermaid
erDiagram
    %% Tablas de Configuración y Usuarios
    roles ||--o{ users : "tiene"
    incident_areas ||--o{ users : "pertenece"
    incident_areas ||--o{ tickets : "ocurre_en"
    users ||--o{ verification_tokens : "genera"
    users ||--o{ tickets : "crea"
    users ||--o{ tickets : "asignado_a"
    users ||--o{ ticket_comments : "escribe"
    users ||--o{ ticket_history : "registra"
    users ||--o{ equipment : "tiene_asignado"
    users ||--o{ tools : "tiene_asignado"

    %% Tablas de Tickets
    ticket_states ||--o{ tickets : "tiene_estado"
    ticket_categories ||--o{ tickets : "tiene_categoria"
    ticket_priorities ||--o{ tickets : "tiene_prioridad"
    tickets ||--o{ ticket_comments : "tiene"
    tickets ||--o{ ticket_history : "registra"
    tickets ||--o{ ticket_equipment : "usa"

    %% Tablas de Inventario - Equipos
    equipment_types ||--o{ equipment : "clasifica"
    equipment ||--o{ ticket_equipment : "asociado_a"

    %% Tablas de Inventario - Consumibles
    consumable_types ||--o{ consumables : "clasifica"

    %% Tablas de Inventario - Herramientas
    tool_types ||--o{ tools : "clasifica"

    %% Definición de Entidades
    roles {
        int id PK
        varchar name UK
        text description
        timestamp created_at
        timestamp updated_at
    }

    incident_areas {
        int id PK
        varchar name UK
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    users {
        int id PK
        varchar full_name
        varchar email UK
        varchar password
        varchar phone
        varchar department
        int incident_area_id FK
        int role_id FK
        varchar security_question_1
        varchar security_answer_1
        varchar security_question_2
        varchar security_answer_2
        boolean email_verified
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    verification_tokens {
        int id PK
        int user_id FK
        varchar token UK
        enum type
        timestamp expires_at
        boolean used
        timestamp created_at
    }

    ticket_states {
        int id PK
        varchar name UK
        text description
        varchar color
        int order
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    ticket_categories {
        int id PK
        varchar name UK
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    ticket_priorities {
        int id PK
        varchar name UK
        int level UK
        varchar color
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    tickets {
        char id PK
        varchar title
        text description
        int incident_area_id FK
        int category_id FK
        int priority_id FK
        int state_id FK
        int created_by_user_id FK
        int assigned_technician_id FK
        text image_url
        timestamp created_at
        timestamp updated_at
        timestamp closed_at
    }

    ticket_comments {
        int id PK
        char ticket_id FK
        int user_id FK
        text content
        timestamp created_at
    }

    ticket_history {
        int id PK
        char ticket_id FK
        int user_id FK
        varchar change_type
        varchar previous_field
        varchar new_field
        text description
        timestamp changed_at
    }

    equipment_types {
        int id PK
        varchar name UK
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    equipment {
        int id PK
        varchar name
        varchar brand
        varchar model
        varchar serial_number UK
        int type_id FK
        enum status
        varchar location
        int assigned_to_user_id FK
        text description
        date purchase_date
        date warranty_expires_at
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    ticket_equipment {
        int id PK
        char ticket_id FK
        int equipment_id FK
        timestamp created_at
    }

    consumable_types {
        int id PK
        varchar name UK
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    consumables {
        int id PK
        varchar name
        int type_id FK
        varchar unit
        int quantity
        int minimum_quantity
        enum status
        varchar location
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    tool_types {
        int id PK
        varchar name UK
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    tools {
        int id PK
        varchar name
        varchar code UK
        int type_id FK
        enum status
        enum tool_condition
        varchar location
        int assigned_to_user_id FK
        text description
        boolean active
        timestamp created_at
        timestamp updated_at
    }
```

## Descripción de Relaciones

### Módulo de Usuarios y Autenticación
- **roles** → **users**: Un rol puede tener muchos usuarios (1:N)
- **incident_areas** → **users**: Un área de incidentes puede tener muchos usuarios (1:N)
- **users** → **verification_tokens**: Un usuario puede tener muchos tokens (1:N)

### Módulo de Tickets
- **ticket_states** → **tickets**: Un estado puede tener muchos tickets (1:N)
- **ticket_categories** → **tickets**: Una categoría puede tener muchos tickets (1:N)
- **ticket_priorities** → **tickets**: Una prioridad puede tener muchos tickets (1:N)
- **incident_areas** → **tickets**: Un área puede tener muchos tickets (1:N)
- **users** → **tickets** (creador): Un usuario puede crear muchos tickets (1:N)
- **users** → **tickets** (técnico): Un usuario puede ser asignado a muchos tickets (1:N)
- **tickets** → **ticket_comments**: Un ticket puede tener muchos comentarios (1:N)
- **tickets** → **ticket_history**: Un ticket puede tener muchos registros de historial (1:N)
- **users** → **ticket_comments**: Un usuario puede escribir muchos comentarios (1:N)
- **users** → **ticket_history**: Un usuario puede registrar muchos cambios (1:N)

### Módulo de Inventario - Equipos
- **equipment_types** → **equipment**: Un tipo puede tener muchos equipos (1:N)
- **users** → **equipment**: Un usuario puede tener asignados muchos equipos (1:N)
- **tickets** → **ticket_equipment**: Un ticket puede usar muchos equipos (N:M)
- **equipment** → **ticket_equipment**: Un equipo puede estar asociado a muchos tickets (N:M)

### Módulo de Inventario - Consumibles
- **consumable_types** → **consumables**: Un tipo puede tener muchos consumibles (1:N)

### Módulo de Inventario - Herramientas
- **tool_types** → **tools**: Un tipo puede tener muchas herramientas (1:N)
- **users** → **tools**: Un usuario puede tener asignadas muchas herramientas (1:N)

## Notas Importantes

- **PK**: Primary Key (Clave Primaria)
- **FK**: Foreign Key (Clave Foránea)
- **UK**: Unique Key (Clave Única)
- Las relaciones N:M se resuelven mediante tablas intermedias (ej: `ticket_equipment`)
- Los timestamps `created_at` y `updated_at` están presentes en la mayoría de las tablas para auditoría
- El campo `active` permite soft-delete en varias entidades
