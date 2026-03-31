package com.oak.platform.product.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * SKU实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_product_sku")
public class ProductSku extends BaseEntity {

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * SKU编码
     */
    private String skuCode;

    /**
     * SKU名称
     */
    private String skuName;

    /**
     * 规格值(JSON)
     */
    private String specValues;

    /**
     * 售价
     */
    private BigDecimal salePrice;

    /**
     * 成本价
     */
    private BigDecimal costPrice;

    /**
     * 库存
     */
    private Integer stock;

    /**
     * 冻结库存
     */
    private Integer frozenStock;

    /**
     * 图片URL
     */
    private String imageUrl;

    /**
     * 条形码
     */
    private String barcode;

    /**
     * 重量(kg)
     */
    private BigDecimal weight;

    /**
     * 状态: 0-禁用 1-启用
     */
    private Integer status;
}