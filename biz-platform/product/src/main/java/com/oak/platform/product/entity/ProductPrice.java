package com.oak.platform.product.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 商品价格实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_product_price")
public class ProductPrice extends BaseEntity {

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * SKU ID
     */
    private Long skuId;

    /**
     * 价格类型: 1-售价 2-市场价 3-成本价 4-会员价
     */
    private Integer priceType;

    /**
     * 价格
     */
    private BigDecimal price;

    /**
     * 会员等级ID（会员价专用）
     */
    private Long memberLevelId;

    /**
     * 开始时间（促销价专用）
     */
    private java.time.LocalDateTime startTime;

    /**
     * 结束时间（促销价专用）
     */
    private java.time.LocalDateTime endTime;

    /**
     * 状态: 0-禁用 1-启用
     */
    private Integer status;
}