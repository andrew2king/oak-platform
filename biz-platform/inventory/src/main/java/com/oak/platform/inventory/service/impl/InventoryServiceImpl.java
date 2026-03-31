package com.oak.platform.inventory.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oak.platform.inventory.entity.Inventory;
import com.oak.platform.inventory.entity.InventoryLog;
import com.oak.platform.inventory.mapper.InventoryMapper;
import com.oak.platform.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 库存服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl extends ServiceImpl<InventoryMapper, Inventory> implements InventoryService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String INVENTORY_TOPIC = "inventory-events";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deductStock(Long skuId, Long warehouseId, Integer quantity) {
        Inventory inventory = getInventory(skuId, warehouseId);
        if (inventory == null) {
            throw new RuntimeException("Inventory not found");
        }

        if (inventory.getAvailableStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        Integer beforeStock = inventory.getAvailableStock();
        inventory.setAvailableStock(inventory.getAvailableStock() - quantity);
        updateById(inventory);

        // 记录库存流水
        logStockChange(inventory, beforeStock, -quantity, 1, "库存扣减");

        // 检查预警
        checkWarning(skuId, warehouseId);

        log.info("Stock deducted: skuId={}, warehouseId={}, quantity={}", skuId, warehouseId, quantity);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addStock(Long skuId, Long warehouseId, Integer quantity) {
        Inventory inventory = getInventory(skuId, warehouseId);
        if (inventory == null) {
            inventory = createInventory(skuId, warehouseId);
        }

        Integer beforeStock = inventory.getAvailableStock();
        inventory.setAvailableStock(inventory.getAvailableStock() + quantity);
        updateById(inventory);

        logStockChange(inventory, beforeStock, quantity, 2, "库存回补");

        log.info("Stock added: skuId={}, warehouseId={}, quantity={}", skuId, warehouseId, quantity);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean freezeStock(Long skuId, Long warehouseId, Integer quantity) {
        Inventory inventory = getInventory(skuId, warehouseId);
        if (inventory == null || inventory.getAvailableStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        inventory.setAvailableStock(inventory.getAvailableStock() - quantity);
        inventory.setFrozenStock(inventory.getFrozenStock() + quantity);
        updateById(inventory);

        log.info("Stock frozen: skuId={}, warehouseId={}, quantity={}", skuId, warehouseId, quantity);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean unfreezeStock(Long skuId, Long warehouseId, Integer quantity) {
        Inventory inventory = getInventory(skuId, warehouseId);
        if (inventory == null || inventory.getFrozenStock() < quantity) {
            throw new RuntimeException("Insufficient frozen stock");
        }

        inventory.setFrozenStock(inventory.getFrozenStock() - quantity);
        inventory.setAvailableStock(inventory.getAvailableStock() + quantity);
        updateById(inventory);

        log.info("Stock unfrozen: skuId={}, warehouseId={}, quantity={}", skuId, warehouseId, quantity);
        return true;
    }

    @Override
    public boolean checkStock(Long skuId, Long warehouseId, Integer quantity) {
        Inventory inventory = getInventory(skuId, warehouseId);
        return inventory != null && inventory.getAvailableStock() >= quantity;
    }

    @Override
    public Integer getAvailableStock(Long skuId, Long warehouseId) {
        Inventory inventory = getInventory(skuId, warehouseId);
        return inventory != null ? inventory.getAvailableStock() : 0;
    }

    @Override
    public void checkWarning(Long skuId, Long warehouseId) {
        Inventory inventory = getInventory(skuId, warehouseId);
        if (inventory != null && inventory.getAvailableStock() <= inventory.getWarningThreshold()) {
            // 发布库存预警事件
            kafkaTemplate.send(INVENTORY_TOPIC, "INVENTORY_WARNING", inventory);
            log.warn("Inventory warning: skuId={}, warehouseId={}, stock={}",
                    skuId, warehouseId, inventory.getAvailableStock());
        }
    }

    private Inventory getInventory(Long skuId, Long warehouseId) {
        return getOne(new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getSkuId, skuId)
                .eq(Inventory::getWarehouseId, warehouseId));
    }

    private Inventory createInventory(Long skuId, Long warehouseId) {
        Inventory inventory = new Inventory();
        inventory.setSkuId(skuId);
        inventory.setWarehouseId(warehouseId);
        inventory.setAvailableStock(0);
        inventory.setFrozenStock(0);
        inventory.setWarningThreshold(10);
        inventory.setStatus(1);
        save(inventory);
        return inventory;
    }

    private void logStockChange(Inventory inventory, Integer beforeStock, Integer changeQty,
                                Integer changeType, String remark) {
        InventoryLog log = new InventoryLog();
        log.setSkuId(inventory.getSkuId());
        log.setWarehouseId(inventory.getWarehouseId());
        log.setChangeType(changeType);
        log.setChangeQuantity(changeQty);
        log.setBeforeStock(beforeStock);
        log.setAfterStock(inventory.getAvailableStock());
        log.setRemark(remark);
        log.setCreateTime(LocalDateTime.now());
        // 保存流水记录...
    }
}