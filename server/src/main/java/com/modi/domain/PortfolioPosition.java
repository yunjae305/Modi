package com.modi.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "portfolio_position",
    uniqueConstraints = @UniqueConstraint(name = "uk_position_user_stock", columnNames = {"user_id", "stock_id"})
)
public class PortfolioPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "average_price", nullable = false)
    private Long averagePrice;

    protected PortfolioPosition() {
    }

    public PortfolioPosition(UserAccount user, Stock stock, Long quantity, Long averagePrice) {
        this.user = user;
        this.stock = stock;
        this.quantity = quantity;
        this.averagePrice = averagePrice;
    }

    public void buy(Long quantity, Long price) {
        Long totalCost = this.averagePrice * this.quantity + price * quantity;
        this.quantity += quantity;
        this.averagePrice = totalCost / this.quantity;
    }

    public void sell(Long quantity) {
        this.quantity -= quantity;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public Stock getStock() {
        return stock;
    }

    public Long getQuantity() {
        return quantity;
    }

    public Long getAveragePrice() {
        return averagePrice;
    }
}
