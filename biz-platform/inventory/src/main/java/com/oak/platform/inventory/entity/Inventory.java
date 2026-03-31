package com.oak.platform.inventory.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_inventory")
public class Inventory extends BaseEntity {

    /**
     * SKU ID
     */
    private Long skuId;

    /**
     * 仓库/门店ID
     */
    private Long warehouseId;

    /**
     * 仓库类型: 1-仓库 2-门店
     */
    private Integer warehouseType;

    /**
     * 可用库存
     */
    private Integer availableStock;

    /**
     * 冻结库存
     */
    private Integer frozenStock;

    /**
     * 预警阈值
     */
    private Integer warningThreshold;

    /**
     * 状态: 0-禁用 1-正常
     */
    private Integer status;
}