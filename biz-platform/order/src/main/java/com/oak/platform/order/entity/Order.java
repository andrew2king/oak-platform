package com.oak.platform.order.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

/**
 * 订单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_order")
public class Order extends BaseEntity {

    /**
     * 订单号
     */
    private String orderNo;

    /**
     * 会员ID
     */
    private Long memberId;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 订单来源: 1-小程序 2-APP 3-POS
     */
    private Integer source;

    /**
     * 订单类型: 1-普通订单 2-自提订单 3-配送订单
     */
    private Integer orderType;

    /**
     * 订单状态: 0-待支付 1-已支付 2-待发货 3-已发货 4-已完成 5-已取消 6-已退款
     */
    private Integer status;

    /**
     * 商品总数量
     */
    private Integer totalQuantity;

    /**
     * 商品总金额
     */
    private BigDecimal totalAmount;

    /**
     * 优惠金额
     */
    private BigDecimal discountAmount;

    /**
     * 运费
     */
    private BigDecimal freightAmount;

    /**
     * 实付金额
     */
    private BigDecimal payAmount;

    /**
     * 支付方式: 1-微信 2-支付宝 3-现金
     */
    private Integer payType;

    /**
     * 支付时间
     */
    private java.time.LocalDateTime payTime;

    /**
     * 发货时间
     */
    private java.time.LocalDateTime deliveryTime;

    /**
     * 完成时间
     */
    private java.time.LocalDateTime finishTime;

    /**
     * 收货人姓名
     */
    private String receiverName;

    /**
     * 收货人电话
     */
    private String receiverPhone;

    /**
     * 收货地址
     */
    private String receiverAddress;

    /**
     * 订单备注
     */
    private String remark;
}