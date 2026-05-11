package com.modi.repository;

import com.modi.domain.PortfolioPosition;
import com.modi.domain.Stock;
import com.modi.domain.UserAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioPositionRepository extends JpaRepository<PortfolioPosition, Long> {

    Optional<PortfolioPosition> findByUserAndStock(UserAccount user, Stock stock);

    List<PortfolioPosition> findAllByUser(UserAccount user);
}
