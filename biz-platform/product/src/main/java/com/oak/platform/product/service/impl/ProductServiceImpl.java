package com.oak.platform.product.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oak.platform.product.entity.Product;
import com.oak.platform.product.mapper.ProductMapper;
import com.oak.platform.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 商品服务实现
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    @Override
    public void online(Long id) {
        Product product = getById(id);
        if (product != null) {
            product.setStatus(1);
            updateById(product);
        }
    }

    @Override
    public void offline(Long id) {
        Product product = getById(id);
        if (product != null) {
            product.setStatus(0);
            updateById(product);
        }
    }
}