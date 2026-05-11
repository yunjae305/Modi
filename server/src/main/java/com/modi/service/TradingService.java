package com.modi.service;

import com.modi.domain.OrderSide;
import com.modi.domain.PortfolioPosition;
import com.modi.domain.Stock;
import com.modi.domain.TradeExecution;
import com.modi.domain.UserAccount;
import com.modi.dto.TradingDtos;
import com.modi.repository.PortfolioPositionRepository;
import com.modi.repository.StockRepository;
import com.modi.repository.TradeExecutionRepository;
import com.modi.repository.UserAccountRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TradingService {

    private static final Long SELL_NET_RATE_NUMERATOR = 99685L;
    private static final Long SELL_NET_RATE_DENOMINATOR = 100000L;

    private final StockRepository stockRepository;
    private final PortfolioPositionRepository positionRepository;
    private final TradeExecutionRepository executionRepository;
    private final UserAccountRepository userRepository;

    public TradingService(
        StockRepository stockRepository,
        PortfolioPositionRepository positionRepository,
        TradeExecutionRepository executionRepository,
        UserAccountRepository userRepository
    ) {
        this.stockRepository = stockRepository;
        this.positionRepository = positionRepository;
        this.executionRepository = executionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TradingDtos.StockItem> stocks() {
        return stockRepository.findAll().stream()
            .sorted(Comparator.comparing(Stock::getId))
            .map(TradingDtos.StockItem::new)
            .toList();
    }

    @Transactional
    public TradingDtos.OrderResult buy(UserAccount user, String stockId, Long requestedQuantity) {
        if (requestedQuantity == null || requestedQuantity <= 0) {
            throw new IllegalArgumentException("주문 수량은 1주 이상이어야 합니다.");
        }
        UserAccount tradingUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Stock stock = stockRepository.findById(stockId)
            .orElseThrow(() -> new IllegalArgumentException("종목을 찾을 수 없습니다."));
        Long price = stock.getCurrentPrice();
        Long filledQuantity = Math.min(requestedQuantity, tradingUser.getCash() / price);
        if (filledQuantity <= 0) {
            throw new IllegalStateException("예수금이 부족합니다.");
        }
        Long totalAmount = price * filledQuantity;
        PortfolioPosition position = positionRepository.findByUserAndStock(tradingUser, stock)
            .orElseGet(() -> new PortfolioPosition(tradingUser, stock, 0L, 0L));
        if (position.getId() == null) {
            positionRepository.save(position);
        }
        position.buy(filledQuantity, price);
        tradingUser.updateCash(tradingUser.getCash() - totalAmount);
        userRepository.save(tradingUser);
        executionRepository.save(new TradeExecution(tradingUser, stock, OrderSide.BUY, filledQuantity, price, totalAmount));
        return new TradingDtos.OrderResult(stockId, OrderSide.BUY, requestedQuantity, filledQuantity, price, totalAmount, tradingUser.getCash());
    }

    @Transactional
    public TradingDtos.OrderResult sell(UserAccount user, String stockId, Long requestedQuantity) {
        if (requestedQuantity == null || requestedQuantity <= 0) {
            throw new IllegalArgumentException("주문 수량은 1주 이상이어야 합니다.");
        }
        UserAccount tradingUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Stock stock = stockRepository.findById(stockId)
            .orElseThrow(() -> new IllegalArgumentException("종목을 찾을 수 없습니다."));
        PortfolioPosition position = positionRepository.findByUserAndStock(tradingUser, stock)
            .orElseThrow(() -> new IllegalStateException("보유 수량이 없습니다."));
        Long filledQuantity = Math.min(requestedQuantity, position.getQuantity());
        if (filledQuantity <= 0) {
            throw new IllegalStateException("보유 수량이 없습니다.");
        }
        Long grossAmount = stock.getCurrentPrice() * filledQuantity;
        Long netAmount = grossAmount * SELL_NET_RATE_NUMERATOR / SELL_NET_RATE_DENOMINATOR;
        position.sell(filledQuantity);
        tradingUser.updateCash(tradingUser.getCash() + netAmount);
        userRepository.save(tradingUser);
        executionRepository.save(new TradeExecution(tradingUser, stock, OrderSide.SELL, filledQuantity, stock.getCurrentPrice(), netAmount));
        return new TradingDtos.OrderResult(stockId, OrderSide.SELL, requestedQuantity, filledQuantity, stock.getCurrentPrice(), netAmount, tradingUser.getCash());
    }

    @Transactional(readOnly = true)
    public TradingDtos.PortfolioSummary portfolio(UserAccount user) {
        List<TradingDtos.PositionItem> positions = positionRepository.findAllByUser(user).stream()
            .filter(position -> position.getQuantity() > 0)
            .map(TradingDtos.PositionItem::new)
            .toList();
        Long stockValue = positions.stream()
            .mapToLong(TradingDtos.PositionItem::getEvaluationAmount)
            .sum();
        return new TradingDtos.PortfolioSummary(user, stockValue, positions);
    }

    @Transactional(readOnly = true)
    public List<TradingDtos.ExecutionItem> executions(UserAccount user) {
        return executionRepository.findAllByUserOrderByExecutedAtDesc(user).stream()
            .map(TradingDtos.ExecutionItem::new)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TradingDtos.RankingItem> ranking() {
        List<UserAccount> users = userRepository.findAll();
        List<TradingDtos.RankingItem> ranking = new ArrayList<>(users.stream()
            .map(user -> {
                TradingDtos.PortfolioSummary summary = portfolio(user);
                return new TradingDtos.RankingItem(0, user.getNickname(), user.getProfileImage(), summary.getTotalAsset(), summary.getProfitRate());
            })
            .sorted(Comparator.comparing(TradingDtos.RankingItem::getTotalAsset).reversed())
            .toList());
        for (int index = 0; index < ranking.size(); index += 1) {
            TradingDtos.RankingItem item = ranking.get(index);
            ranking.set(index, new TradingDtos.RankingItem(index + 1, item.getNickname(), item.getProfileImage(), item.getTotalAsset(), item.getProfitRate()));
        }
        return ranking;
    }
}
