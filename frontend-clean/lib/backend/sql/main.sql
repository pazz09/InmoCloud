DROP DATABASE if exists inmocloud;
CREATE DATABASE inmocloud;

DROP USER if exists 'corredor';
CREATE USER 'corredor'@'%' IDENTIFIED BY 'contrasenaCorredor';

DROP USER if exists 'server';
CREATE USER 'server'@'%' IDENTIFIED BY 'contrasenaServer';



use inmocloud;


CREATE TABLE users_t (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name TEXT NOT NULL,
  role ENUM('Corredor', 'Propietario', 'Arrendatario', 'Administrador') NOT NULL,
  passwordHash TEXT NOT NULL,
  rut TEXT NOT NULL
);


INSERT INTO users_t (name, role, passwordHash, rut) VALUES
('Carlos Corredor',     'Corredor',     '$2b$10$MYv7M9NzO33FwkZMyNWZwO/xl07nJYI86K1O8c7ACx1yVHl470i5G', '11.111.111-1'),
('Patricia Propietaria','Propietario',  '$2b$10$QqS1OleeUdna2dh1lw.wVu6sUBZtjw7Bi6SUlriaw.OL8WIXC8JRO', '22.222.222-2'),
('Luis Arrendatario',   'Arrendatario', '$2b$10$hVS0cFxSh1GUO91eVEDOoeizmnEI6OndtB1.9UZ8z5hzuNZq1yTeS', '33.333.333-3'),
('Ana Administradora',  'Administrador','$2b$10$6C.DuPVcbCgMCoUKw.3jJeCzQ2VmduIb0NSdDDCUSvTOlx./txHdS', '44.444.444-4');

GRANT ALL PRIVILEGES ON inmocloud.* TO corredor;
GRANT ALL PRIVILEGES ON inmocloud.* TO server;
FLUSH PRIVILEGES;
