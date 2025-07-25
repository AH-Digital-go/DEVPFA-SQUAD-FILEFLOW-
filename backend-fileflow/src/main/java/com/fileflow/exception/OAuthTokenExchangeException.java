package com.fileflow.exception;

public class OAuthTokenExchangeException extends RuntimeException {
    public OAuthTokenExchangeException(String message, Throwable cause) {
        super(message, cause);
    }
}
