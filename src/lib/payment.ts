import Refund from "./refund";
import YooKassa, { Amount } from "./yookassa";

export interface PaymentData {
    id: string;
    status: string;
    amount: Amount;
    confirmation?: {
        type: string;
        confirmation_url?: string;
    };
    [key: string]: any; // для дополнительных полей API
}

export default class Payment implements PaymentData {
    static PENDING = "pending";
    static WAITING_FOR_CAPTURE = "waiting_for_capture";
    static SUCCEEDED = "succeeded";
    static CANCELED = "canceled";

    id!: string;
    status!: string;
    amount!: Amount;
    confirmation?: { type: string; confirmation_url?: string };
    [key: string]: any;

    private _instance!: YooKassa;

    constructor(instance: YooKassa, data: PaymentData) {
        Object.assign(this, data, { _instance: instance });
    }

    /**
     * Is payment pending
     */
    get isPending(): boolean {
        return this.status === Payment.PENDING;
    }

    /**
     * Is payment waiting for capture
     */
    get isWaitingForCapture(): boolean {
        return this.status === Payment.WAITING_FOR_CAPTURE;
    }

    /**
     * Is payment succeeded
     */
    get isSucceeded(): boolean {
        return this.status === Payment.SUCCEEDED;
    }

    /**
     * Is payment canceled
     */
    get isCanceled(): boolean {
        return this.status === Payment.CANCELED;
    }

    /**
     * Is payment succeeded or canceled
     */
    get isResolved(): boolean {
        return (
            this.status === Payment.SUCCEEDED ||
            this.status === Payment.CANCELED
        );
    }

    get confirmationUrl(): string | undefined {
        return this.confirmation?.confirmation_url;
    }

    /**
     * Retrieve payment info
     */
    reload(): Promise<boolean> {
        return this._instance.getPayment(this.id).then((data: PaymentData) => {
            Object.assign(this, data);
            return true;
        });
    }

    /**
     * Capture payment
     */
    capture(amount?: Amount): Promise<boolean> {
        return this._instance
            .capturePayment(this.id, amount || this.amount)
            .then((data: PaymentData) => {
                Object.assign(this, data);
                return true;
            });
    }

    /**
     * Cancel Payment
     */
    cancel(): Promise<boolean> {
        return this._instance.cancelPayment(this.id).then((data: PaymentData) => {
            Object.assign(this, data);
            return true;
        });
    }

    /**
     * Create refund
     */
    refund(amount?: Amount): Promise<Refund> {
        return this._instance.createRefund(this.id, amount || this.amount);
    }
}
