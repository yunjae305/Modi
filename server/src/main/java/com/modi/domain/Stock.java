package com.modi.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stock")
public class Stock {

    @Id
    private String id;

    @Column(name = "stock_name", nullable = false)
    private String name;

    @Column(name = "market", nullable = false)
    private String market;

    @Column(name = "current_price", nullable = false)
    private Long currentPrice;

    @Column(name = "previous_close", nullable = false)
    private Long previousClose;

    @Column(name = "image_url")
    private String imageUrl;

    protected Stock() {
    }

    public Stock(String id, String name, String market, Long currentPrice, Long previousClose, String imageUrl) {
        this.id = id;
        this.name = name;
        this.market = market;
        this.currentPrice = currentPrice;
        this.previousClose = previousClose;
        this.imageUrl = imageUrl;
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

    public String getImageUrl() {
        return imageUrl;
    }
}
