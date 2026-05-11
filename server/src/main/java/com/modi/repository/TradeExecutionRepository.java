package com.modi.repository;

import com.modi.domain.TradeExecution;
import com.modi.domain.UserAccount;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradeExecutionRepository extends JpaRepository<TradeExecution, Long> {

    List<TradeExecution> findAllByUserOrderByExecutedAtDesc(UserAccount user);
}
