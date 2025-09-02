import request, { CoreOptions, RequiredUriUrl, Response } from "request";
import { v4 as uuid } from "uuid";

import Payment from "./payment";
import Refund from "./refund";
import PaymentError from "./payment-error";
import utils from "./utils";

const DEFAULT_URL = "https://api.yookassa.ru/v3/";
const DEFAULT_DEBUG = false;
const DEFAULT_TIMEOUT = 120000; // 2 minutes (Node's default timeout)
const DEFAULT_DELAY = 60000; // 1 minute

// ---------------- Типы ----------------

export interface YooKassaOptions {
    shopId: string;
    secretKey: string;
    apiUrl?: string;
    debug?: boolean;
    timeout?: number;
    retryDelay?: number;
}

export interface Amount {
    value: string;
    currency: string;
}

export interface RequestPayload {
    [key: string]: any;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// ---------------- Класс ----------------

export default class YooKassa {
    private shopId: string;
    private secretKey: string;
    private apiUrl: string;
    private debug: boolean;
    private timeout: number;
    private retryDelay: number;

    constructor({
        shopId,
        secretKey,
        apiUrl = DEFAULT_URL,
        debug = DEFAULT_DEBUG,
        timeout = DEFAULT_TIMEOUT,
        retryDelay = DEFAULT_DELAY
    }: YooKassaOptions) {
        this.shopId = shopId;
        this.secretKey = secretKey;
        this.apiUrl = apiUrl;
        this.debug = debug;
        this.timeout = timeout;
        this.retryDelay = retryDelay;
    }

    /**
     * Create a payment
     */
    createPayment(payload: RequestPayload, idempotenceKey?: string): Promise<Payment> {
        return this.request("POST", "payments", payload, idempotenceKey).then(
            (data: any) => new Payment(this, data)
        );
    }

    /**
     * Get info about a payment by id
     */
    getPayment(paymentId: string, idempotenceKey?: string): Promise<Payment> {
        return this.request("GET", `payments/${paymentId}`, {}, idempotenceKey).then(
            (data: any) => new Payment(this, data)
        );
    }

    /**
     * Capture a payment
     */
    capturePayment(paymentId: string, amount: Amount, idempotenceKey?: string): Promise<Payment> {
        return this.request("POST", `payments/${paymentId}/capture`, { amount }, idempotenceKey).then(
            (data: any) => new Payment(this, data)
        );
    }

    /**
     * Cancel a payment
     */
    cancelPayment(paymentId: string, idempotenceKey?: string): Promise<Payment> {
        return this.request("POST", `payments/${paymentId}/cancel`, {}, idempotenceKey).then(
            (data: any) => new Payment(this, data)
        );
    }

    /**
     * Create a refund
     */
    createRefund(paymentId: string, amount: Amount, idempotenceKey?: string): Promise<Refund> {
        return this.request("POST", "refunds", { payment_id: paymentId, amount }, idempotenceKey).then(
            (data: any) => new Refund(this, data)
        );
    }

    /**
     * Get info about a refund
     */
    getRefund(refundId: string, idempotenceKey?: string): Promise<Refund> {
        return this.request("GET", `refunds/${refundId}`, {}, idempotenceKey).then(
            (data: any) => new Refund(this, data)
        );
    }

    /**
     * Core request method
     */
    private request<T = any>(
        method: HttpMethod,
        path: string,
        payload: RequestPayload,
        idempotenceKey?: string
    ): Promise<T> {
        if (!idempotenceKey) {
            idempotenceKey = uuid();
        }

        const uri = this.apiUrl + path;

        if (this.debug) {
            console.log(`${method}: ${uri}`);
        }

        return new Promise<Response>((resolve, reject) => {
            const options: CoreOptions & RequiredUriUrl = {
                method,
                uri,
                json: true,
                body: payload,
                timeout: this.timeout,
                auth: {
                    user: this.shopId,
                    pass: this.secretKey
                },
                headers: {
                    "Idempotence-Key": idempotenceKey
                }
            };

            request(options, (error, response, body) => {
                if (error) return reject(error);

                if (response.body?.type === "error") {
                    return reject(response.body);
                }

                resolve(response);
            });
        })
            .then((response: Response & { body: any }) => {
                switch (response.statusCode) {
                    case 202:
                        return utils(
                            response.body.retry_after as number || this.retryDelay
                        ).then(() => this.request<T>(method, path, payload, idempotenceKey));
                    default:
                        return response.body as T;
                }
            })
            .catch((error: any) => {
                return Promise.reject(new PaymentError(error));
            });
    }
}

