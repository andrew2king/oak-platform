package com.oak.platform.order.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oak.platform.order.entity.Order;
import com.oak.platform.order.entity.OrderItem;
import com.oak.platform.order.mapper.OrderMapper;
import com.oak.platform.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slfjj;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String ORDER_TOPIC = "order-events";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(Order order) {
        // 生成订单号
        order.setOrderNo(generateOrderNo());
        order.setStatus(0); // 待支付
        order.setCreateTime(LocalDateTime.now());

        // 保存订单
        save(order);

        // 发布订单创建事件
        publishOrderEvent("ORDER_CREATED", order);

        log.info("Order created: {}", order.getOrderNo());
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void payOrder(Long orderId, Integer payType) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        if (order.getStatus() != 0) {
            throw new RuntimeException("Invalid order status");
        }

        order.setStatus(1); // 已支付
        order.setPayType(payType);
        order.setPayTime(LocalDateTime.now());
        updateById(order);

        // 发布订单支付事件
        publishOrderEvent("ORDER_PAID", order);

        log.info("Order paid: {}", order.getOrderNo());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        if (order.getStatus() > 1) {
            throw new RuntimeException("Cannot cancel order in current status");
        }

        order.setStatus(5); // 已取消
        updateById(order);

        // 发布订单取消事件（用于库存回补）
        publishOrderEvent("ORDER_CANCELLED", order);

        log.info("Order cancelled: {}", order.getOrderNo());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deliver(Long orderId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        if (order.getStatus() != 2) {
            throw new RuntimeException("Invalid order status for delivery");
        }

        order.setStatus(3); // 已发货
        order.setDeliveryTime(LocalDateTime.now());
        updateById(order);

        publishOrderEvent("ORDER_DELIVERED", order);

        log.info("Order delivered: {}", order.getOrderNo());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirm(Long orderId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        if (order.getStatus() != 3) {
            throw new RuntimeException("Invalid order status for confirmation");
        }

        order.setStatus(4); // 已完成
        order.setFinishTime(LocalDateTime.now());
        updateById(order);

        publishOrderEvent("ORDER_COMPLETED", order);

        log.info("Order completed: {}", order.getOrderNo());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void refund(Long orderId, String reason) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        if (order.getStatus() < 1) {
            throw new RuntimeException("Cannot refund unpaid order");
        }

        order.setStatus(6); // 已退款
        updateById(order);

        publishOrderEvent("ORDER_REFUNDED", order);

        log.info("Order refunded: {}, reason: {}", order.getOrderNo(), reason);
    }

    private String generateOrderNo() {
        return "O" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }

    private void publishOrderEvent(String eventType, Order order) {
        try {
            kafkaTemplate.send(ORDER_TOPIC, eventType, order);
        } catch (Exception e) {
            log.error("Failed to publish order event: {}", eventType, e);
        }
    }
}