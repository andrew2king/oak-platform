package com.oak.platform.product.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oak.platform.product.entity.Product;

/**
 * 商品服务接口
 */
public interface ProductService extends IService<Product> {

    /**
     * 上架商品
     */
    void online(Long id);

    /**
     * 下架商品
     */
    void offline(Long id);
}