package com.oak.platform.product.controller;

import com.oak.platform.common.result.Result;
import com.oak.platform.product.entity.Product;
import com.oak.platform.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 商品控制器
 */
@Tag(name = "商品管理")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "创建商品")
    @PostMapping
    public Result<Product> create(@RequestBody Product product) {
        return Result.success(productService.save(product));
    }

    @Operation(summary = "根据ID查询商品")
    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.success(productService.getById(id));
    }

    @Operation(summary = "更新商品")
    @PutMapping("/{id}")
    public Result<Product> update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return Result.success(productService.updateById(product));
    }

    @Operation(summary = "删除商品")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productService.removeById(id);
        return Result.success();
    }

    @Operation(summary = "上架商品")
    @PutMapping("/{id}/online")
    public Result<Void> online(@PathVariable Long id) {
        productService.online(id);
        return Result.success();
    }

    @Operation(summary = "下架商品")
    @PutMapping("/{id}/offline")
    public Result<Void> offline(@PathVariable Long id) {
        productService.offline(id);
        return Result.success();
    }
}