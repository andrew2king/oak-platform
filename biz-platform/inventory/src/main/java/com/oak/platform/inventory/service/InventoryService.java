package com.oak.platform.inventory.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oak.platform.inventory.entity.Inventory;

/**
 * 库存服务接口
 */
public interface InventoryService extends IService<Inventory> {

    /**
     * 扣减库存
     * @param skuId SKU ID
     * @param warehouseId 仓库ID
     * @param quantity 数量
     * @return 是否成功
     */
    boolean deductStock(Long skuId, Long warehouseId, Integer quantity);

    /**
     * 回补库存
     */
    boolean addStock(Long skuId, Long warehouseId, Integer quantity);

    /**
     * 锁定库存
     */
    boolean freezeStock(Long skuId, Long warehouseId, Integer quantity);

    /**
     * 解锁库存
     */
    boolean unfreezeStock(Long skuId, Long warehouseId, Integer quantity);

    /**
     * 检查库存是否充足
     */
    boolean checkStock(Long skuId, Long warehouseId, Integer quantity);

    /**
     * 获取可用库存
     */
    Integer getAvailableStock(Long skuId, Long warehouseId);

    /**
     * 库存预警检查
     */
    void checkWarning(Long skuId, Long warehouseId);
}