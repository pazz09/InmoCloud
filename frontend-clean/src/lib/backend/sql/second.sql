DROP DATABASE if exists inmocloud;
CREATE DATABASE inmocloud;

DROP USER if exists 'corredor';
CREATE USER 'corredor'@'%' IDENTIFIED BY 'contrasenaCorredor';

DROP USER if exists 'server';
DROP USER if exists 'server'@'localhost';
CREATE USER 'server'@'%' IDENTIFIED BY 'contrasenaServer';
CREATE USER 'server'@'localhost' IDENTIFIED BY 'contrasenaServer';



use inmocloud;


CREATE TABLE users_t (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  telefono VARCHAR(20),
  mail VARCHAR(100),
  role ENUM('Corredor', 'Propietario', 'Arrendatario', 'Administrador') NOT NULL,
  passwordHash TEXT, 
  rut VARCHAR(15) UNIQUE NOT NULL
);

INSERT INTO users_t (nombre, apellidos, telefono, mail, role, passwordHash, rut) VALUES
('Carlos',   'Corredor',     '912345678', 'carlos@inmobiliaria.cl',     'Corredor',     '$2b$10$MYv7M9NzO33FwkZMyNWZwO/xl07nJYI86K1O8c7ACx1yVHl470i5G', '11.111.111-1'),
('Patricia', 'Propietaria',  '922345678', 'patricia@propiedades.cl',    'Propietario',  '$2b$10$QqS1OleeUdna2dh1lw.wVu6sUBZtjw7Bi6SUlriaw.OL8WIXC8JRO', '22.222.222-2'),
('Luis',     'Arrendatario', '933345678', 'luis@arrendatarios.cl',      'Arrendatario', '$2b$10$QqS1OleeUdna2dh1lw.wVu6sUBZtjw7Bi6SUlriaw.OL8WIXC8JRO', '33.333.333-3'),
('Ana',      'Administradora','944345678','ana@administracion.cl',      'Administrador','$2b$10$6C.DuPVcbCgMCoUKw.3jJeCzQ2VmduIb0NSdDDCUSvTOlx./txHdS', '44.444.444-4');


-- PROPERTIES
CREATE TABLE properties_t (
  id INT AUTO_INCREMENT PRIMARY KEY,
  direccion TEXT NOT NULL,
  activa BOOLEAN DEFAULT TRUE, -- estado 
  valor DECIMAL(12, 2) NOT NULL, -- valor arriendo?
  propietario_id INT NOT NULL,
  arrendatario_id INT DEFAULT NULL,
  rol VARCHAR(15) UNIQUE NOT NULL,
  fecha_arriendo DATE DEFAULT NULL,
  FOREIGN KEY (propietario_id) REFERENCES users_t(id),
  FOREIGN KEY (arrendatario_id) REFERENCES users_t(id)
);

-- Add unique constraint to propietario_id
ALTER TABLE properties_t
ADD CONSTRAINT unique_arrendatario UNIQUE (arrendatario_id);

-- Seed properties
INSERT INTO properties_t (direccion, activa, propietario_id, arrendatario_id, valor, rol) VALUES
('Calle 123, Santiago', TRUE, 2, 3, 300000, "111"),
('Avenida 456, Viña', TRUE, 2, NULL, 380000, "222"),
('Camino 789, La Serena', FALSE, 2, NULL, 250000, "332");

CREATE TABLE pagos_t (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,

  tipo BOOLEAN COMMENT 'FALSE = depósito, TRUE = giro',
  monto DECIMAL(12, 2), -- saldo
  pagado BOOLEAN DEFAULT FALSE,

  categoria ENUM('CAT_A', 'CAT_B', 'CAT_C', 'CAT_D') NOT NULL,
  detalle TEXT,

  propiedad_id INT,
  usuario_id INT NOT NULL,

  FOREIGN KEY (propiedad_id) REFERENCES properties_t(id),
  FOREIGN KEY (usuario_id) REFERENCES users_t(id)
  -- ✅ Check constraint to allow only one of giro or deposito
);

-- 💰 Pagos actualizados
INSERT INTO pagos_t (fecha, monto, tipo, categoria, detalle, pagado, propiedad_id, usuario_id) VALUES
('2025-05-20', 450000, FALSE, 'CAT_A', 'Pago arriendo mayo', TRUE, 1, 3),
('2025-04-20', 450000, FALSE, 'CAT_A', 'Pago arriendo abril', TRUE, 1, 3),
('2025-05-25', 150000, TRUE, 'CAT_B', 'Reparación caldera', FALSE, 1, 2),
('2025-06-01', 500000, FALSE, 'CAT_A', 'Pago arriendo junio', TRUE, 2, 3),
('2025-05-30', 120000, TRUE, 'CAT_C', 'Honorarios corredor', TRUE, 2, 1),
('2025-05-15', 300000, TRUE, 'CAT_A', 'Pago arriendo parcial', FALSE, 3, 3);-- Seed transactions

-- Reportes

CREATE TABLE reports_t (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pdf_blob MEDIUMBLOB NOT NULL, -- Up to 16MB
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users_t(id)
);


GRANT ALL PRIVILEGES ON inmocloud.* TO corredor;
GRANT ALL PRIVILEGES ON inmocloud.* TO server;
FLUSH PRIVILEGES;


