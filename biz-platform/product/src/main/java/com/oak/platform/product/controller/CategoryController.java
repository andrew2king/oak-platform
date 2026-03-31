package com.oak.platform.product.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oak.platform.common.result.Result;
import com.oak.platform.product.entity.Category;
import com.oak.platform.product.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器
 */
@Tag(name = "分类管理")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "创建分类")
    @PostMapping
    public Result<Category> create(@RequestBody Category category) {
        return Result.success(categoryService.save(category));
    }

    @Operation(summary = "更新分类")
    @PutMapping("/{id}")
    public Result<Category> update(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        return Result.success(categoryService.updateById(category));
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.removeById(id);
        return Result.success();
    }

    @Operation(summary = "获取分类树")
    @GetMapping("/tree")
    public Result<List<Category>> tree() {
        return Result.success(categoryService.getCategoryTree());
    }

    @Operation(summary = "获取子分类")
    @GetMapping("/children/{parentId}")
    public Result<List<Category>> children(@PathVariable Long parentId) {
        return Result.success(categoryService.getChildren(parentId));
    }
}