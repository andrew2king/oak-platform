package com.oak.platform.product.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oak.platform.product.entity.Category;
import com.oak.platform.product.mapper.CategoryMapper;
import com.oak.platform.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 分类服务实现
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> getCategoryTree() {
        List<Category> allCategories = list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSort));

        // 构建树结构
        Map<Long, List<Category>> categoryMap = allCategories.stream()
                .collect(Collectors.groupingBy(Category::getParentId));

        List<Category> rootCategories = categoryMap.getOrDefault(0L, new ArrayList<>());
        buildTree(rootCategories, categoryMap);

        return rootCategories;
    }

    @Override
    public List<Category> getChildren(Long parentId) {
        return list(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, parentId)
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSort));
    }

    private void buildTree(List<Category> categories, Map<Long, List<Category>> categoryMap) {
        for (Category category : categories) {
            List<Category> children = categoryMap.getOrDefault(category.getId(), new ArrayList<>());
            if (!children.isEmpty()) {
                buildTree(children, categoryMap);
            }
        }
    }
}