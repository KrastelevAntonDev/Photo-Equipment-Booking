export interface PaymentErrorData {
    message: string;
    description?: string;
    id?: string;
    code?: string;
    parameter?: string;
    [key: string]: any; // для любых дополнительных полей API
}

export default class PaymentError extends Error {
    id?: string;
    code?: string;
    parameter?: string;

    constructor(error: PaymentErrorData) {
        super(error.message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PaymentError);
        } else {
            this.stack = new Error().stack;
        }

        this.name = "PaymentError";
        this.message = error.description || error.message;
        this.id = error.id;
        this.code = error.code;
        this.parameter = error.parameter;
    }
}
