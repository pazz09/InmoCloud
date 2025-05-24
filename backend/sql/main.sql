DROP DATABASE inmocloud;
CREATE DATABASE inmocloud;

DROP USER if exists 'corredor';
CREATE USER 'corredor'@'%' IDENTIFIED BY 'contrasenaCorredor';

DROP USER if exists 'server';
CREATE USER 'server'@'%' IDENTIFIED BY 'contrasenaServer';



use inmocloud;
GRANT ALL PRIVILEGES ON inmocloud.* TO corredor;
GRANT ALL PRIVILEGES ON inmocloud.* TO server;


CREATE TABLE users_t (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rut VARCHAR(12) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role ENUM('Corredor', 'Propietario', 'Arrendatario', 'Administrador') NOT NULL,
  passwordHash TEXT NOT NULL
);


INSERT INTO users_t (name, role, passwordHash, rut) VALUES
('Carlos Corredor',     'Corredor',      'hashed_password_1', '12.345.678-1'),
('Patricia Propietaria','Propietario',  'hashed_password_2', '11.111.111-1'),
('Luis Arrendatario',   'Arrendatario', 'hashed_password_3', '22.222.222-2'),
('Ana Administradora',  'Administrador', 'hashed_password_4', '33.333.333-3');
