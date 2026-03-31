package com.oak.platform.member.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oak.platform.member.entity.Member;
import com.oak.platform.member.entity.MemberLevel;
import com.oak.platform.member.mapper.MemberMapper;
import com.oak.platform.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 会员服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServiceImpl extends ServiceImpl<MemberMapper, Member> implements MemberService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Member register(String phone, String nickname, Integer source) {
        // 检查手机号是否已注册
        Member existMember = getByPhone(phone);
        if (existMember != null) {
            throw new RuntimeException("Phone already registered");
        }

        Member member = new Member();
        member.setMemberNo(generateMemberNo());
        member.setPhone(phone);
        member.setNickname(nickname != null ? nickname : "用户" + phone.substring(7));
        member.setSource(source);
        member.setLevelId(1L); // 默认普通会员
        member.setPoints(0);
        member.setTotalPoints(0);
        member.setTotalAmount(BigDecimal.ZERO);
        member.setStatus(1);
        member.setCreateTime(LocalDateTime.now());

        save(member);

        log.info("Member registered: {}", member.getMemberNo());
        return member;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Member wxLogin(String code) {
        // TODO: 调用微信API获取openid
        String openid = "mock_openid_" + code;

        // 查找是否已注册
        Member member = getOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getWxOpenid, openid));

        if (member == null) {
            // 自动注册
            member = new Member();
            member.setMemberNo(generateMemberNo());
            member.setWxOpenid(openid);
            member.setSource(1); // 小程序
            member.setLevelId(1L);
            member.setPoints(0);
            member.setTotalPoints(0);
            member.setTotalAmount(BigDecimal.ZERO);
            member.setStatus(1);
            member.setCreateTime(LocalDateTime.now());
            save(member);
            log.info("Member registered via WeChat: {}", member.getMemberNo());
        }

        // 更新最后登录时间
        member.setLastLoginTime(LocalDateTime.now());
        updateById(member);

        return member;
    }

    @Override
    public Member getByPhone(String phone) {
        return getOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getPhone, phone));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePoints(Long memberId, Integer points, String reason) {
        Member member = getById(memberId);
        if (member == null) {
            throw new RuntimeException("Member not found");
        }

        Integer beforePoints = member.getPoints();
        member.setPoints(member.getPoints() + points);
        if (points > 0) {
            member.setTotalPoints(member.getTotalPoints() + points);
        }
        updateById(member);

        // TODO: 记录积分流水
        log.info("Member points updated: memberId={}, change={}, before={}, after={}",
                memberId, points, beforePoints, member.getPoints());

        // 更新等级
        updateLevel(memberId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateLevel(Long memberId) {
        Member member = getById(memberId);
        if (member == null) {
            return;
        }

        // 根据累计积分计算等级
        Integer totalPoints = member.getTotalPoints();

        // TODO: 从数据库查询等级规则
        Long newLevelId = calculateLevel(totalPoints);

        if (!newLevelId.equals(member.getLevelId())) {
            member.setLevelId(newLevelId);
            updateById(member);
            log.info("Member level updated: memberId={}, newLevel={}", memberId, newLevelId);
        }
    }

    @Override
    public void addTag(Long memberId, Long tagId) {
        // TODO: 实现标签关联
        log.info("Tag added: memberId={}, tagId={}", memberId, tagId);
    }

    @Override
    public void removeTag(Long memberId, Long tagId) {
        // TODO: 实现标签移除
        log.info("Tag removed: memberId={}, tagId={}", memberId, tagId);
    }

    private String generateMemberNo() {
        return "M" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }

    private Long calculateLevel(Integer totalPoints) {
        if (totalPoints >= 20000) return 4L; // 钻石
        if (totalPoints >= 5000) return 3L;  // 金卡
        if (totalPoints >= 1000) return 2L;  // 银卡
        return 1L; // 普通
    }
}