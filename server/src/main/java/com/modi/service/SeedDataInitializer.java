package com.modi.service;

import com.modi.domain.Stock;
import com.modi.repository.StockRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedDataInitializer implements CommandLineRunner {

    private final StockRepository stockRepository;

    public SeedDataInitializer(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Override
    public void run(String... args) {
        if (stockRepository.count() > 0) {
            return;
        }
        stockRepository.saveAll(List.of(
            new Stock("005930", "삼성전자", "KOSPI", 67500L, 68400L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/005930.png"),
            new Stock("000660", "SK하이닉스", "KOSPI", 114700L, 112000L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/000660.png"),
            new Stock("035420", "NAVER", "KOSPI", 190900L, 188000L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/035420.png"),
            new Stock("035720", "카카오", "KOSPI", 41700L, 42100L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/035720.png"),
            new Stock("005380", "현대차", "KOSPI", 191000L, 189500L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/005380.png"),
            new Stock("005490", "POSCO홀딩스", "KOSPI", 527000L, 511000L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/005490.png"),
            new Stock("000080", "하이트진로", "KOSPI", 19660L, 18890L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/000080.png"),
            new Stock("015760", "한국전력", "KOSPI", 17570L, 17500L, "https://file.alphasquare.co.kr/media/images/stock_logo/kr/015760.png")
        ));
    }
}
