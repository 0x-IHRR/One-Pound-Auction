export class MarketplaceError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, statusCode = 400, code = 'MARKETPLACE_ERROR') {
        super(message);
        this.name = 'MarketplaceError';
        this.statusCode = statusCode;
        this.code = code;
    }
}

export function isMarketplaceError(error: unknown): error is MarketplaceError {
    return error instanceof MarketplaceError;
}
