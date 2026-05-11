package com.modi.common;

public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String error;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, T data, String error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> fail(String error) {
        return new ApiResponse<>(false, null, error);
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }

    public String getError() {
        return error;
    }
}
