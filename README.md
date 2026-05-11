# Backend — Sistema de Exposiciones

Node.js + Express + MySQL · Dockerizado

## Levantar con un solo comando

```bash
docker compose up --build
```

Eso levanta:
- **MySQL** en el puerto `3306` (con datos de prueba)
- **Backend API** en `http://localhost:8080/api/v1`

## Usuarios de prueba

| Username | Password | Grupo   |
|----------|----------|---------|
| alumno1  | 123456   | Grupo A |
| alumno2  | 123456   | Grupo A |
| alumno3  | 123456   | Grupo B |
| alumno4  | 123456   | Grupo B |
| alumno5  | 123456   | Grupo C |

## Endpoints disponibles

| Método | Ruta                    | Auth | Descripción              |
|--------|-------------------------|------|--------------------------|
| POST   | /auth/login             | No   | Obtener JWT              |
| GET    | /materias               | Sí   | Listar (paginado+filtro) |
| POST   | /materias               | Sí   | Crear                    |
| PUT    | /materias/:id           | Sí   | Actualizar               |
| DELETE | /materias/:id           | Sí   | Eliminar                 |
| GET    | /grupos                 | Sí   | Listar grupos            |
| POST   | /grupos                 | Sí   | Crear grupo              |
| GET    | /alumnos                | Sí   | Listar alumnos           |
| POST   | /alumnos                | Sí   | Crear alumno             |
| GET    | /equipos                | Sí   | Listar equipos           |
| POST   | /equipos                | Sí   | Crear equipo             |
| GET    | /exposiciones           | Sí   | Listar exposiciones      |
| POST   | /exposiciones           | Sí   | Crear exposición         |
| GET    | /criterios              | Sí   | Listar criterios rúbrica |
| POST   | /evaluaciones           | Sí   | Registrar evaluación     |

## Detener

```bash
docker compose down
```

## Borrar todo (incluyendo base de datos)

```bash
docker compose down -v
```
