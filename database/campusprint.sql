-- ============================================================================
-- CampusPrint Database Schema & Seed Data
-- Designed for MySQL on XAMPP (InnoDB Engine, utf8mb4 collation)
-- Tagline: "Your Campus. Your Shop. Your Print."
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS `campusprint`;
CREATE DATABASE `campusprint` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `campusprint`;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- Core authentication table for all 3 roles: customer, shop_owner, admin
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Hashed with password_hash(PASSWORD_BCRYPT)
  `phone` VARCHAR(30) NOT NULL,
  `role` ENUM('customer', 'shop_owner', 'admin') NOT NULL DEFAULT 'customer',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. Table: customers
-- Extended profile for university students
-- ----------------------------------------------------------------------------
CREATE TABLE `customers` (
  `user_id` INT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `university_name` VARCHAR(150) NOT NULL DEFAULT 'Daffodil International University',
  `department` VARCHAR(100) NOT NULL,
  `delivery_address` VARCHAR(255) NOT NULL,
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. Table: shop_owners
-- Legal owner credentials (NID kept strictly confidential)
-- ----------------------------------------------------------------------------
CREATE TABLE `shop_owners` (
  `user_id` INT PRIMARY KEY,
  `owner_name` VARCHAR(120) NOT NULL,
  `nid_number` VARCHAR(50) NOT NULL, -- Strict confidentiality: not exposed in public endpoints
  CONSTRAINT `fk_shop_owners_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. Table: locations
-- Predefined location IDs (Strict ID matching rule)
-- ----------------------------------------------------------------------------
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `district` VARCHAR(60) NOT NULL DEFAULT 'Dhaka',
  `default_delivery_charge` DECIMAL(10,2) NOT NULL DEFAULT 20.00
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. Table: shops
-- Printing vendor profile and operational details
-- ----------------------------------------------------------------------------
CREATE TABLE `shops` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `owner_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `tagline` VARCHAR(255) NULL,
  `shop_location_id` INT NOT NULL, -- Physical shop location
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `opening_hours` VARCHAR(100) NOT NULL DEFAULT '8:00 AM - 10:00 PM',
  `prep_time` VARCHAR(60) NOT NULL DEFAULT '25-35 mins',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.80,
  `total_reviews` INT NOT NULL DEFAULT 0,
  `loyalty_rate_per_10tk` DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  `is_open` TINYINT(1) NOT NULL DEFAULT 1,
  `verification_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_shops_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shops_location` FOREIGN KEY (`shop_location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. Table: shop_pricing
-- Individual pricing per shop for each paper size, color, binding & lamination
-- ----------------------------------------------------------------------------
CREATE TABLE `shop_pricing` (
  `shop_id` INT PRIMARY KEY,
  `bw_a4_single` DECIMAL(8,2) NOT NULL DEFAULT 1.50,
  `bw_a4_double` DECIMAL(8,2) NOT NULL DEFAULT 2.50,
  `color_a4_single` DECIMAL(8,2) NOT NULL DEFAULT 5.00,
  `color_a4_double` DECIMAL(8,2) NOT NULL DEFAULT 8.00,
  `bw_a3_single` DECIMAL(8,2) NOT NULL DEFAULT 6.00,
  `color_a3_single` DECIMAL(8,2) NOT NULL DEFAULT 15.00,
  `binding_spiral` DECIMAL(8,2) NOT NULL DEFAULT 25.00,
  `binding_tape` DECIMAL(8,2) NOT NULL DEFAULT 15.00,
  `binding_hardcover` DECIMAL(8,2) NOT NULL DEFAULT 120.00,
  `lamination_a4` DECIMAL(8,2) NOT NULL DEFAULT 12.00,
  `lamination_a3` DECIMAL(8,2) NOT NULL DEFAULT 25.00,
  CONSTRAINT `fk_shop_pricing_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. Table: shop_delivery_areas
-- Mapping of areas where a shop provides home delivery and specific charges
-- ----------------------------------------------------------------------------
CREATE TABLE `shop_delivery_areas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `delivery_charge` DECIMAL(8,2) NOT NULL DEFAULT 20.00,
  UNIQUE KEY `uk_shop_location` (`shop_id`, `location_id`),
  CONSTRAINT `fk_delivery_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delivery_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. Table: trade_licenses
-- Confidential verification documents submitted by shop owners
-- ----------------------------------------------------------------------------
CREATE TABLE `trade_licenses` (
  `shop_id` INT PRIMARY KEY,
  `license_number` VARCHAR(100) NOT NULL,
  `document_path` VARCHAR(255) NOT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` INT NULL,
  `review_notes` TEXT NULL,
  CONSTRAINT `fk_trade_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. Table: orders
-- Real-time printing orders (strictly Cash on Delivery / Cash on Pickup)
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` VARCHAR(30) PRIMARY KEY, -- e.g. 'CP-1042'
  `customer_id` INT NOT NULL,
  `shop_id` INT NOT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_path` VARCHAR(255) NOT NULL,
  `print_type` ENUM('bw', 'color') NOT NULL DEFAULT 'bw',
  `paper_size` ENUM('A4', 'A3') NOT NULL DEFAULT 'A4',
  `print_side` ENUM('single', 'double') NOT NULL DEFAULT 'single',
  `pages` INT NOT NULL DEFAULT 1,
  `copies` INT NOT NULL DEFAULT 1,
  `binding` VARCHAR(60) NOT NULL DEFAULT 'none',
  `lamination` VARCHAR(60) NOT NULL DEFAULT 'none',
  `delivery_type` ENUM('self_pickup', 'home_delivery') NOT NULL DEFAULT 'self_pickup',
  `delivery_area_id` INT NULL,
  `delivery_address` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `preferred_time` VARCHAR(100) NULL,
  `printing_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `binding_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `lamination_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_payable` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(20) NOT NULL DEFAULT 'COD',
  `payment_status` ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
  `order_status` ENUM('pending', 'accepted', 'processing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `loyalty_points_earned` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`),
  CONSTRAINT `fk_orders_location` FOREIGN KEY (`delivery_area_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. Table: loyalty_balances
-- Accumulated loyalty points per customer per shop
-- ----------------------------------------------------------------------------
CREATE TABLE `loyalty_balances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `shop_id` INT NOT NULL,
  `points_balance` INT NOT NULL DEFAULT 0,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_customer_shop_points` (`customer_id`, `shop_id`),
  CONSTRAINT `fk_points_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_points_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DATA (Instant Functional Demo in XAMPP)
-- ============================================================================

-- Locations (DIU - Ashulia Zone)
INSERT INTO `locations` (`id`, `name`, `code`, `district`, `default_delivery_charge`) VALUES
(1, 'Daffodil Smart City', 'DSC', 'Dhaka', 20.00),
(2, 'Ashulia', 'ASH', 'Dhaka', 30.00),
(3, 'Baipayl', 'BAI', 'Dhaka', 40.00),
(4, 'Savar', 'SAV', 'Dhaka', 50.00),
(5, 'Hall Area (DIU Campus)', 'HALL', 'Dhaka', 15.00),
(6, 'Model Town', 'MT', 'Dhaka', 25.00);

-- Pre-hashed password for 'demo1234': $2y$10$wT0E0rM1yU5Cq04sK9QhU.T9E8zNqB0I9V4c2Xz1QpWzL9j5N6R2e
-- For ease of testing, password for all demo accounts is 'demo1234'
INSERT INTO `users` (`id`, `email`, `password`, `phone`, `role`, `is_active`) VALUES
(1, 'admin@campusprint.com', '$2y$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQ6G6W9S4s2Q1wQZ6iLma', '01921646409', 'admin', 1),
(101, 'student@diu.edu.bd', '$2y$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQ6G6W9S4s2Q1wQZ6iLma', '01712345678', 'customer', 1),
(201, 'smartprint.diu@gmail.com', '$2y$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQ6G6W9S4s2Q1wQZ6iLma', '01711223344', 'shop_owner', 1),
(202, 'campusxerox.lab@gmail.com', '$2y$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQ6G6W9S4s2Q1wQZ6iLma', '01819887766', 'shop_owner', 1);

-- Customer profile
INSERT INTO `customers` (`user_id`, `full_name`, `university_name`, `department`, `delivery_address`) VALUES
(101, 'Tanzim Ahmed', 'Daffodil International University', 'Computer Science & Engineering', 'DSC Hall 3, Room 402, Ashulia');

-- Shop Owner profiles
INSERT INTO `shop_owners` (`user_id`, `owner_name`, `nid_number`) VALUES
(201, 'Md. Rafiqul Islam', '19842691234567890'),
(202, 'Kamrul Hasan', '19892691234567891');

-- Shops
INSERT INTO `shops` (`id`, `owner_id`, `name`, `tagline`, `shop_location_id`, `address`, `phone`, `email`, `opening_hours`, `prep_time`, `rating`, `total_reviews`, `loyalty_rate_per_10tk`, `is_open`, `verification_status`) VALUES
(1, 201, 'Smart Print Point', 'Fastest thesis & assignment printing inside campus', 1, 'Gate 1, Daffodil Smart City, Ashulia', '01711223344', 'smartprint.diu@gmail.com', '8:00 AM - 10:00 PM', '20-30 mins', 4.90, 142, 2.00, 1, 'approved'),
(2, 202, 'Campus Xerox & Digital Lab', 'Quality color prints, poster & engineering drawing', 5, 'Opposite Scholar Garden, DIU', '01819887766', 'campuszerox.lab@gmail.com', '8:30 AM - 11:00 PM', '25-35 mins', 4.80, 98, 1.50, 1, 'approved');

-- Shop Pricing
INSERT INTO `shop_pricing` (`shop_id`, `bw_a4_single`, `bw_a4_double`, `color_a4_single`, `color_a4_double`, `bw_a3_single`, `color_a3_single`, `binding_spiral`, `binding_tape`, `binding_hardcover`, `lamination_a4`, `lamination_a3`) VALUES
(1, 1.50, 2.50, 5.00, 8.00, 6.00, 15.00, 25.00, 15.00, 120.00, 12.00, 25.00),
(2, 1.50, 2.20, 4.50, 7.50, 5.00, 14.00, 20.00, 15.00, 110.00, 10.00, 20.00);

-- Shop Delivery Areas
INSERT INTO `shop_delivery_areas` (`shop_id`, `location_id`, `delivery_charge`) VALUES
(1, 1, 20.00),
(1, 2, 30.00),
(1, 5, 15.00),
(2, 5, 10.00),
(2, 1, 20.00),
(2, 2, 30.00),
(2, 6, 25.00);

-- Orders
INSERT INTO `orders` (`id`, `customer_id`, `shop_id`, `document_name`, `document_path`, `print_type`, `paper_size`, `print_side`, `pages`, `copies`, `binding`, `lamination`, `delivery_type`, `delivery_area_id`, `delivery_address`, `customer_phone`, `printing_cost`, `binding_cost`, `lamination_cost`, `delivery_charge`, `discount_amount`, `total_payable`, `payment_method`, `payment_status`, `order_status`, `loyalty_points_earned`) VALUES
('CP-1042', 101, 1, 'CSE412_Thesis.pdf', 'uploads/documents/CSE412_Thesis.pdf', 'bw', 'A4', 'double', 48, 2, 'Spiral Binding', 'none', 'home_delivery', 1, 'DSC Hall 3, Room 402, Ashulia', '01712345678', 120.00, 50.00, 0.00, 20.00, 0.00, 190.00, 'COD', 'paid', 'completed', 38),
('CP-1049', 101, 1, 'Algorithms_Lab_Report_04.pdf', 'uploads/documents/Algorithms_Lab_Report_04.pdf', 'color', 'A4', 'single', 12, 1, 'Tape Binding', 'none', 'self_pickup', NULL, 'Pickup at Smart Print Point counter', '01712345678', 60.00, 15.00, 0.00, 0.00, 0.00, 75.00, 'COD', 'unpaid', 'ready', 0);

-- Loyalty balances
INSERT INTO `loyalty_balances` (`customer_id`, `shop_id`, `points_balance`) VALUES
(101, 1, 3750),
(101, 2, 1200);

SET FOREIGN_KEY_CHECKS = 1;
