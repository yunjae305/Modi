package com.modi.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_execution")
public class TradeExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(name = "side", nullable = false)
    private OrderSide side;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "price", nullable = false)
    private Long price;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "executed_at", nullable = false)
    private LocalDateTime executedAt;

    protected TradeExecution() {
    }

    public TradeExecution(UserAccount user, Stock stock, OrderSide side, Long quantity, Long price, Long totalAmount) {
        this.user = user;
        this.stock = stock;
        this.side = side;
        this.quantity = quantity;
        this.price = price;
        this.totalAmount = totalAmount;
        this.executedAt = LocalDateTime.now();
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
