package com.oak.platform.product.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 商品实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_product")
public class Product extends BaseEntity {

    /**
     * 商品编码
     */
    private String productCode;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 商品英文名
     */
    private String productNameEn;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 品牌ID
     */
    private Long brandId;

    /**
     * 商品简介
     */
    private String description;

    /**
     * 商品详情
     */
    private String detail;

    /**
     * 主图URL
     */
    private String mainImage;

    /**
     * 图片列表(JSON)
     */
    private String images;

    /**
     * 售价
     */
    private BigDecimal salePrice;

    /**
     * 市场价
     */
    private BigDecimal marketPrice;

    /**
     * 成本价
     */
    private BigDecimal costPrice;

    /**
     * 单位
     */
    private String unit;

    /**
     * 重量(kg)
     */
    private BigDecimal weight;

    /**
     * 状态: 0-下架 1-上架
     */
    private Integer status;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 是否热门
     */
    private Integer isHot;

    /**
     * 是否新品
     */
    private Integer isNew;
}