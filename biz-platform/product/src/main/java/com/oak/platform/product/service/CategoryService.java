package com.oak.platform.product.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oak.platform.product.entity.Category;

import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService extends IService<Category> {

    /**
     * 获取分类树
     */
    List<Category> getCategoryTree();

    /**
     * 获取子分类
     */
    List<Category> getChildren(Long parentId);
}