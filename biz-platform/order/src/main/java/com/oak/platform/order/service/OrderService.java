package com.oak.platform.order.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oak.platform.order.entity.Order;

/**
 * 订单服务接口
 */
public interface OrderService extends IService<Order> {

    /**
     * 创建订单
     */
    Order createOrder(Order order);

    /**
     * 支付订单
     */
    void payOrder(Long orderId, Integer payType);

    /**
     * 取消订单
     */
    void cancelOrder(Long orderId);

    /**
     * 发货
     */
    void deliver(Long orderId);

    /**
     * 确认收货
     */
    void confirm(Long orderId);

    /**
     * 申请退款
     */
    void refund(Long orderId, String reason);
}