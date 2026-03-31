-- =============================================
-- Oak Platform 数据库初始化脚本
-- 版本: 1.0.0
-- 日期: 2026-03-31
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS oak_platform WITH ENCODING = 'UTF8';

-- 切换到目标数据库
\c oak_platform;

-- =============================================
-- 商品相关表
-- =============================================

-- 分类表
CREATE TABLE IF NOT EXISTS t_category (
    id BIGINT PRIMARY KEY,
    parent_id BIGINT DEFAULT 0,
    category_name VARCHAR(100) NOT NULL,
    category_icon VARCHAR(255),
    sort INT DEFAULT 0,
    level INT DEFAULT 1,
    status INT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_category IS '商品分类表';

-- 品牌表
CREATE TABLE IF NOT EXISTS t_brand (
    id BIGINT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    brand_name_en VARCHAR(100),
    brand_logo VARCHAR(255),
    description TEXT,
    sort INT DEFAULT 0,
    status INT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_brand IS '品牌表';

-- 商品表
CREATE TABLE IF NOT EXISTS t_product (
    id BIGINT PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    product_name_en VARCHAR(200),
    category_id BIGINT,
    brand_id BIGINT,
    description VARCHAR(500),
    detail TEXT,
    main_image VARCHAR(500),
    images TEXT,
    sale_price DECIMAL(10,2),
    market_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    unit VARCHAR(20),
    weight DECIMAL(10,3),
    status INT DEFAULT 0,
    sort INT DEFAULT 0,
    is_hot INT DEFAULT 0,
    is_new INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_product IS '商品表';
CREATE INDEX idx_product_category ON t_product(category_id);
CREATE INDEX idx_product_brand ON t_product(brand_id);
CREATE INDEX idx_product_status ON t_product(status);

-- SKU表
CREATE TABLE IF NOT EXISTS t_product_sku (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku_code VARCHAR(50) NOT NULL UNIQUE,
    sku_name VARCHAR(200),
    spec_values TEXT,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock INT DEFAULT 0,
    frozen_stock INT DEFAULT 0,
    image_url VARCHAR(500),
    barcode VARCHAR(50),
    weight DECIMAL(10,3),
    status INT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_product_sku IS 'SKU表';
CREATE INDEX idx_sku_product ON t_product_sku(product_id);

-- =============================================
-- 订单相关表
-- =============================================

-- 订单表
CREATE TABLE IF NOT EXISTS t_order (
    id BIGINT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    member_id BIGINT,
    store_id BIGINT,
    source INT,
    order_type INT,
    status INT DEFAULT 0,
    total_quantity INT,
    total_amount DECIMAL(12,2),
    discount_amount DECIMAL(12,2),
    freight_amount DECIMAL(10,2),
    pay_amount DECIMAL(12,2),
    pay_type INT,
    pay_time TIMESTAMP,
    delivery_time TIMESTAMP,
    finish_time TIMESTAMP,
    receiver_name VARCHAR(50),
    receiver_phone VARCHAR(20),
    receiver_address VARCHAR(500),
    remark VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_order IS '订单表';
CREATE INDEX idx_order_member ON t_order(member_id);
CREATE INDEX idx_order_status ON t_order(status);
CREATE INDEX idx_order_create_time ON t_order(create_time);

-- 订单项表
CREATE TABLE IF NOT EXISTS t_order_item (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    sku_id BIGINT,
    product_code VARCHAR(50),
    sku_code VARCHAR(50),
    product_name VARCHAR(200),
    sku_name VARCHAR(200),
    product_image VARCHAR(500),
    quantity INT,
    price DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    amount DECIMAL(12,2),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_order_item IS '订单项表';
CREATE INDEX idx_order_item_order ON t_order_item(order_id);

-- =============================================
-- 库存相关表
-- =============================================

-- 库存表
CREATE TABLE IF NOT EXISTS t_inventory (
    id BIGINT PRIMARY KEY,
    sku_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    warehouse_type INT,
    available_stock INT DEFAULT 0,
    frozen_stock INT DEFAULT 0,
    warning_threshold INT DEFAULT 10,
    status INT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_inventory IS '库存表';
CREATE UNIQUE INDEX idx_inventory_sku_warehouse ON t_inventory(sku_id, warehouse_id);

-- 库存流水表
CREATE TABLE IF NOT EXISTS t_inventory_log (
    id BIGINT PRIMARY KEY,
    sku_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    change_type INT,
    change_quantity INT,
    before_stock INT,
    after_stock INT,
    order_no VARCHAR(50),
    remark VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id BIGINT
);

COMMENT ON TABLE t_inventory_log IS '库存流水表';
CREATE INDEX idx_inventory_log_sku ON t_inventory_log(sku_id);

-- =============================================
-- 会员相关表
-- =============================================

-- 会员表
CREATE TABLE IF NOT EXISTS t_member (
    id BIGINT PRIMARY KEY,
    member_no VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    nickname VARCHAR(100),
    avatar VARCHAR(500),
    real_name VARCHAR(50),
    gender INT DEFAULT 0,
    birthday DATE,
    email VARCHAR(100),
    wx_openid VARCHAR(100),
    wx_unionid VARCHAR(100),
    level_id BIGINT,
    points INT DEFAULT 0,
    total_points INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status INT DEFAULT 1,
    source INT,
    last_login_time TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_member IS '会员表';
CREATE INDEX idx_member_phone ON t_member(phone);

-- 会员等级表
CREATE TABLE IF NOT EXISTS t_member_level (
    id BIGINT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    level_code VARCHAR(20),
    min_points INT DEFAULT 0,
    max_points INT,
    discount DECIMAL(3,2),
    icon VARCHAR(255),
    status INT DEFAULT 1,
    sort INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    tenant_id BIGINT
);

COMMENT ON TABLE t_member_level IS '会员等级表';

-- 积分流水表
CREATE TABLE IF NOT EXISTS t_member_points_log (
    id BIGINT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    change_type INT,
    change_points INT,
    before_points INT,
    after_points INT,
    order_no VARCHAR(50),
    remark VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id BIGINT
);

COMMENT ON TABLE t_member_points_log IS '积分流水表';
CREATE INDEX idx_points_log_member ON t_member_points_log(member_id);

-- =============================================
-- 初始化数据
-- =============================================

-- 初始化会员等级
INSERT INTO t_member_level (id, level_name, level_code, min_points, max_points, discount, sort, tenant_id) VALUES
(1, '普通会员', 'NORMAL', 0, 999, 1.00, 1, 1),
(2, '银卡会员', 'SILVER', 1000, 4999, 0.98, 2, 1),
(3, '金卡会员', 'GOLD', 5000, 19999, 0.95, 3, 1),
(4, '钻石会员', 'DIAMOND', 20000, 999999, 0.90, 4, 1);

-- 初始化租户
INSERT INTO t_tenant (id, tenant_name, tenant_code, status, create_time) VALUES
(1, '演示租户', 'DEMO', 1, CURRENT_TIMESTAMP);

-- =============================================
-- 完成提示
-- =============================================

SELECT 'Database initialization completed!' AS message;