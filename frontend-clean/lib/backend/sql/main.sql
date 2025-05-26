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
  passwordHash TEXT NOT NULL
);


INSERT INTO users_t (name, role, passwordHash) VALUES
('Carlos Corredor',     'Corredor',     'hashed_password_1'),
('Patricia Propietaria','Propietario', 'hashed_password_2'),
('Luis Arrendatario',   'Arrendatario', 'hashed_password_3'),
('Ana Administradora',  'Administrador','hashed_password_4');

GRANT ALL PRIVILEGES ON inmocloud.* TO corredor;
GRANT ALL PRIVILEGES ON inmocloud.* TO server;
FLUSH PRIVILEGES;
