import YooKassa, { Amount } from "./yookassa";

export interface RefundData {
    id: string;
    status: string;
    payment_id: string;
    amount: Amount;
    [key: string]: any; // поддержка дополнительных полей API
}

export default class Refund implements RefundData {
    id!: string;
    status!: string;
    payment_id!: string;
    amount!: Amount;
    [key: string]: any;

    private _instance!: YooKassa;

    constructor(instance: YooKassa, data: RefundData) {
        Object.assign(this, data, { _instance: instance });
    }

    /**
     * Обновить информацию о возврате
     */
    reload(): Promise<boolean> {
        return this._instance.getRefund(this.id).then((data: RefundData) => {
            Object.assign(this, data);
            return true;
        });
    }
}
