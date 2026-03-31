package com.oak.platform.member.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.oak.platform.member.entity.Member;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberMapper extends BaseMapper<Member> {
}