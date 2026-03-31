package com.oak.platform.member.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oak.platform.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 会员实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_member")
public class Member extends BaseEntity {

    /**
     * 会员编号
     */
    private String memberNo;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 性别: 0-未知 1-男 2-女
     */
    private Integer gender;

    /**
     * 生日
     */
    private java.time.LocalDate birthday;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 微信openid
     */
    private String wxOpenid;

    /**
     * 微信unionid
     */
    private String wxUnionid;

    /**
     * 等级ID
     */
    private Long levelId;

    /**
     * 当前积分
     */
    private Integer points;

    /**
     * 累计积分
     */
    private Integer totalPoints;

    /**
     * 累计消费金额
     */
    private java.math.BigDecimal totalAmount;

    /**
     * 状态: 0-禁用 1-正常
     */
    private Integer status;

    /**
     * 注册来源: 1-小程序 2-APP 3-门店
     */
    private Integer source;

    /**
     * 最后登录时间
     */
    private java.time.LocalDateTime lastLoginTime;
}