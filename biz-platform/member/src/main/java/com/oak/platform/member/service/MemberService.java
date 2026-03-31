package com.oak.platform.member.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oak.platform.member.entity.Member;

/**
 * 会员服务接口
 */
public interface MemberService extends IService<Member> {

    /**
     * 会员注册
     */
    Member register(String phone, String nickname, Integer source);

    /**
     * 微信登录
     */
    Member wxLogin(String code);

    /**
     * 根据手机号查询
     */
    Member getByPhone(String phone);

    /**
     * 更新积分
     */
    void updatePoints(Long memberId, Integer points, String reason);

    /**
     * 计算并更新等级
     */
    void updateLevel(Long memberId);

    /**
     * 添加标签
     */
    void addTag(Long memberId, Long tagId);

    /**
     * 移除标签
     */
    void removeTag(Long memberId, Long tagId);
}