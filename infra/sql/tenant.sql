-- =============================================
-- Oak Platform 租户表
-- =============================================

CREATE TABLE IF NOT EXISTS t_tenant (
    id BIGINT PRIMARY KEY,
    tenant_name VARCHAR(100) NOT NULL,
    tenant_code VARCHAR(50) NOT NULL UNIQUE,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    package_type INT DEFAULT 1,
    expire_time TIMESTAMP,
    status INT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    deleted INT DEFAULT 0
);

COMMENT ON TABLE t_tenant IS '租户表';

-- 租户资源配额表
CREATE TABLE IF NOT EXISTS t_tenant_quota (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    cpu_limit INT DEFAULT 4,
    memory_limit INT DEFAULT 8,
    storage_limit INT DEFAULT 100,
    api_qps_limit INT DEFAULT 1000,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE t_tenant_quota IS '租户配额表';