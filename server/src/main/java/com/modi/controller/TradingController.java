package com.modi.controller;

import com.modi.common.ApiResponse;
import com.modi.domain.UserAccount;
import com.modi.dto.TradingDtos;
import com.modi.service.AuthService;
import com.modi.service.TradingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TradingController {

    private final AuthService authService;
    private final TradingService tradingService;

    @Value("${modi.session-cookie-name}")
    private String sessionCookieName;

    public TradingController(AuthService authService, TradingService tradingService) {
        this.authService = authService;
        this.tradingService = tradingService;
    }

    @GetMapping("/stocks")
    public ApiResponse<List<TradingDtos.StockItem>> stocks() {
        return ApiResponse.success(tradingService.stocks());
    }

    @GetMapping("/portfolio")
    public ApiResponse<TradingDtos.PortfolioSummary> portfolio(HttpServletRequest request) {
        UserAccount user = authService.requireUser(request, sessionCookieName);
        return ApiResponse.success(tradingService.portfolio(user));
    }

    @GetMapping("/executions")
    public ApiResponse<List<TradingDtos.ExecutionItem>> executions(HttpServletRequest request) {
        UserAccount user = authService.requireUser(request, sessionCookieName);
        return ApiResponse.success(tradingService.executions(user));
    }

    @PostMapping("/orders/buy")
    public ApiResponse<TradingDtos.OrderResult> buy(HttpServletRequest request, @Valid @RequestBody TradingDtos.OrderRequest orderRequest) {
        UserAccount user = authService.requireUser(request, sessionCookieName);
        return ApiResponse.success(tradingService.buy(user, orderRequest.getStockId(), orderRequest.getQuantity()));
    }

    @PostMapping("/orders/sell")
    public ApiResponse<TradingDtos.OrderResult> sell(HttpServletRequest request, @Valid @RequestBody TradingDtos.OrderRequest orderRequest) {
        UserAccount user = authService.requireUser(request, sessionCookieName);
        return ApiResponse.success(tradingService.sell(user, orderRequest.getStockId(), orderRequest.getQuantity()));
    }

    @GetMapping("/rankings")
    public ApiResponse<List<TradingDtos.RankingItem>> rankings() {
        return ApiResponse.success(tradingService.ranking());
    }
}
