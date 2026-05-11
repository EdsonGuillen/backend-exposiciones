-- ── Base de datos ────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS exposiciones_db;
USE exposiciones_db;

-- ── Tablas ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS materias (
  id_materia     INT AUTO_INCREMENT PRIMARY KEY,
  clave_materia  VARCHAR(20)  NOT NULL UNIQUE,
  nombre_materia VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS grupos (
  id_grupo    INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL,
  id_materia  INT NOT NULL,
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alumnos (
  id_alumno INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  username  VARCHAR(50)  NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  id_grupo  INT,
  FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS equipos (
  id_equipo  INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  id_grupo   INT NOT NULL,
  FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipo_alumnos (
  id_equipo INT NOT NULL,
  id_alumno INT NOT NULL,
  PRIMARY KEY (id_equipo, id_alumno),
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE,
  FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS criterios (
  id_criterio INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS exposiciones (
  id_exposicion INT AUTO_INCREMENT PRIMARY KEY,
  titulo        VARCHAR(150) NOT NULL,
  fecha         DATE,
  id_equipo     INT NOT NULL,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id_evaluacion       INT AUTO_INCREMENT PRIMARY KEY,
  id_exposicion       INT NOT NULL,
  id_alumno_evaluador INT NOT NULL,
  creado_en           DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_eval (id_exposicion, id_alumno_evaluador),
  FOREIGN KEY (id_exposicion)       REFERENCES exposiciones(id_exposicion) ON DELETE CASCADE,
  FOREIGN KEY (id_alumno_evaluador) REFERENCES alumnos(id_alumno)          ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluacion_detalles (
  id_detalle    INT AUTO_INCREMENT PRIMARY KEY,
  id_evaluacion INT NOT NULL,
  id_criterio   INT NOT NULL,
  calificacion  DECIMAL(4,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 10),
  FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
  FOREIGN KEY (id_criterio)   REFERENCES criterios(id_criterio)      ON DELETE CASCADE
);

-- ── Datos de prueba ───────────────────────────────────────────────

INSERT INTO materias (clave_materia, nombre_materia) VALUES
  ('PROG-01', 'Programación Web'),
  ('BD-01',   'Bases de Datos'),
  ('REDES-01','Redes de Computadoras');

INSERT INTO grupos (nombre, id_materia) VALUES
  ('Grupo A', 1),
  ('Grupo B', 1),
  ('Grupo C', 2);

-- Contraseña: 123456 (texto plano para demo; en producción usar bcrypt)
INSERT INTO alumnos (nombre, username, password, id_grupo) VALUES
  ('Juan Pérez',    'alumno1', '123456', 1),
  ('María García',  'alumno2', '123456', 1),
  ('Carlos López',  'alumno3', '123456', 2),
  ('Ana Martínez',  'alumno4', '123456', 2),
  ('Luis Rodríguez','alumno5', '123456', 3);

INSERT INTO equipos (nombre, id_grupo) VALUES
  ('Equipo Alpha', 1),
  ('Equipo Beta',  1),
  ('Equipo Gamma', 2);

INSERT INTO equipo_alumnos VALUES (1,1),(1,2),(2,3),(2,4),(3,5);

INSERT INTO criterios (nombre) VALUES
  ('Dominio del tema'),
  ('Claridad en la exposición'),
  ('Material de apoyo'),
  ('Manejo del tiempo'),
  ('Respuesta a preguntas');

INSERT INTO exposiciones (titulo, fecha, id_equipo) VALUES
  ('Introducción a React',    '2025-05-15', 1),
  ('APIs REST con Node.js',   '2025-05-16', 2),
  ('Diseño de base de datos', '2025-05-17', 3);
