package com.modi.dto;

import com.modi.domain.OrderSide;
import com.modi.domain.PortfolioPosition;
import com.modi.domain.Stock;
import com.modi.domain.TradeExecution;
import com.modi.domain.UserAccount;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

public class TradingDtos {

    public static class StockItem {
        private String id;
        private String name;
        private String market;
        private Long currentPrice;
        private Long previousClose;
        private Double changeRate;
        private String imageUrl;

        public StockItem(Stock stock) {
            this.id = stock.getId();
            this.name = stock.getName();
            this.market = stock.getMarket();
            this.currentPrice = stock.getCurrentPrice();
            this.previousClose = stock.getPreviousClose();
            this.changeRate = stock.getPreviousClose() == 0 ? 0 : (stock.getCurrentPrice() - stock.getPreviousClose()) / (double) stock.getPreviousClose();
            this.imageUrl = stock.getImageUrl();
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getMarket() {
            return market;
        }

        public Long getCurrentPrice() {
            return currentPrice;
        }

        public Long getPreviousClose() {
            return previousClose;
        }

        public Double getChangeRate() {
            return changeRate;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }

    public static class OrderRequest {
        @NotBlank
        private String stockId;

        @Min(1)
        private Long quantity;

        public String getStockId() {
            return stockId;
        }

        public Long getQuantity() {
            return quantity;
        }
    }

    public static class OrderResult {
        private String stockId;
        private OrderSide side;
        private Long requestedQuantity;
        private Long filledQuantity;
        private Long price;
        private Long totalAmount;
        private Long cash;

        public OrderResult(String stockId, OrderSide side, Long requestedQuantity, Long filledQuantity, Long price, Long totalAmount, Long cash) {
            this.stockId = stockId;
            this.side = side;
            this.requestedQuantity = requestedQuantity;
            this.filledQuantity = filledQuantity;
            this.price = price;
            this.totalAmount = totalAmount;
            this.cash = cash;
        }

        public String getStockId() {
            return stockId;
        }

        public OrderSide getSide() {
            return side;
        }

        public Long getRequestedQuantity() {
            return requestedQuantity;
        }

        public Long getFilledQuantity() {
            return filledQuantity;
        }

        public Long getPrice() {
            return price;
        }

        public Long getTotalAmount() {
            return totalAmount;
        }

        public Long getCash() {
            return cash;
        }
    }

    public static class PositionItem {
        private String stockId;
        private String stockName;
        private Long quantity;
        private Long averagePrice;
        private Long currentPrice;
        private Long evaluationAmount;
        private Long profitAmount;
        private Double profitRate;

        public PositionItem(PortfolioPosition position) {
            Stock stock = position.getStock();
            this.stockId = stock.getId();
            this.stockName = stock.getName();
            this.quantity = position.getQuantity();
            this.averagePrice = position.getAveragePrice();
            this.currentPrice = stock.getCurrentPrice();
            this.evaluationAmount = this.currentPrice * this.quantity;
            this.profitAmount = (this.currentPrice - this.averagePrice) * this.quantity;
            this.profitRate = this.averagePrice == 0 ? 0 : (this.currentPrice - this.averagePrice) / (double) this.averagePrice;
        }

        public String getStockId() {
            return stockId;
        }

        public String getStockName() {
            return stockName;
        }

        public Long getQuantity() {
            return quantity;
        }

        public Long getAveragePrice() {
            return averagePrice;
        }

        public Long getCurrentPrice() {
            return currentPrice;
        }

        public Long getEvaluationAmount() {
            return evaluationAmount;
        }

        public Long getProfitAmount() {
            return profitAmount;
        }

        public Double getProfitRate() {
            return profitRate;
        }
    }

    public static class PortfolioSummary {
        private Long userId;
        private Long seedMoney;
        private Long cash;
        private Long stockValue;
        private Long totalAsset;
        private Long profitAmount;
        private Double profitRate;
        private List<PositionItem> positions;

        public PortfolioSummary(UserAccount user, Long stockValue, List<PositionItem> positions) {
            this.userId = user.getId();
            this.seedMoney = user.getSeedMoney();
            this.cash = user.getCash();
            this.stockValue = stockValue;
            this.totalAsset = user.getCash() + stockValue;
            this.profitAmount = this.totalAsset - user.getSeedMoney();
            this.profitRate = user.getSeedMoney() == 0 ? 0 : this.profitAmount / (double) user.getSeedMoney();
            this.positions = positions;
        }

        public Long getUserId() {
            return userId;
        }

        public Long getSeedMoney() {
            return seedMoney;
        }

        public Long getCash() {
            return cash;
        }

        public Long getStockValue() {
            return stockValue;
        }

        public Long getTotalAsset() {
            return totalAsset;
        }

        public Long getProfitAmount() {
            return profitAmount;
        }

        public Double getProfitRate() {
            return profitRate;
        }

        public List<PositionItem> getPositions() {
            return positions;
        }
    }

    public static class ExecutionItem {
        private Long id;
        private String stockId;
        private String stockName;
        private OrderSide side;
        private Long quantity;
        private Long price;
        private Long totalAmount;
        private LocalDateTime executedAt;

        public ExecutionItem(TradeExecution execution) {
            this.id = execution.getId();
            this.stockId = execution.getStock().getId();
            this.stockName = execution.getStock().getName();
            this.side = execution.getSide();
            this.quantity = execution.getQuantity();
            this.price = execution.getPrice();
            this.totalAmount = execution.getTotalAmount();
            this.executedAt = execution.getExecutedAt();
        }

        public Long getId() {
            return id;
        }

        public String getStockId() {
            return stockId;
        }

        public String getStockName() {
            return stockName;
        }

        public OrderSide getSide() {
            return side;
        }

        public Long getQuantity() {
            return quantity;
        }

        public Long getPrice() {
            return price;
        }

        public Long getTotalAmount() {
            return totalAmount;
        }

        public LocalDateTime getExecutedAt() {
            return executedAt;
        }
    }

    public static class RankingItem {
        private Integer rank;
        private String nickname;
        private String profileImage;
        private Long totalAsset;
        private Double profitRate;

        public RankingItem(Integer rank, String nickname, String profileImage, Long totalAsset, Double profitRate) {
            this.rank = rank;
            this.nickname = nickname;
            this.profileImage = profileImage;
            this.totalAsset = totalAsset;
            this.profitRate = profitRate;
        }

        public Integer getRank() {
            return rank;
        }

        public String getNickname() {
            return nickname;
        }

        public String getProfileImage() {
            return profileImage;
        }

        public Long getTotalAsset() {
            return totalAsset;
        }

        public Double getProfitRate() {
            return profitRate;
        }
    }
}
