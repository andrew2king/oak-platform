package com.oak.platform.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 响应状态码
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAILED(500, "操作失败"),
    VALIDATE_FAILED(400, "参数校验失败"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    // 业务错误码 1000-1999
    PRODUCT_NOT_FOUND(1001, "商品不存在"),
    PRODUCT_SKU_NOT_FOUND(1002, "SKU不存在"),
    PRODUCT_PRICE_INVALID(1003, "价格无效"),

    // 订单错误码 2000-2999
    ORDER_NOT_FOUND(2001, "订单不存在"),
    ORDER_STATUS_INVALID(2002, "订单状态无效"),
    ORDER_CREATE_FAILED(2003, "订单创建失败"),

    // 库存错误码 3000-3999
    INVENTORY_NOT_ENOUGH(3001, "库存不足"),
    INVENTORY_LOCK_FAILED(3002, "库存锁定失败"),

    // 会员错误码 4000-4999
    MEMBER_NOT_FOUND(4001, "会员不存在"),
    MEMBER_PHONE_EXISTS(4002, "手机号已存在");

    private final Integer code;
    private final String message;
}