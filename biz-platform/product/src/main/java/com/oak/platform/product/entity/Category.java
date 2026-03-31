package com.oak.platform.product.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 商品分类实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_category")
public class Category extends BaseEntity {

    /**
     * 父分类ID
     */
    private Long parentId;

    /**
     * 分类名称
     */
    private String categoryName;

    /**
     * 分类图标
     */
    private String categoryIcon;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 层级
     */
    private Integer level;

    /**
     * 状态: 0-禁用 1-启用
     */
    private Integer status;
}