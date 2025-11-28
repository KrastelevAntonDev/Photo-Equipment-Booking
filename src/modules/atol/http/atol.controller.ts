import { Request, Response } from 'express';
import { AtolService } from '../application/atol.service';
import { ReceiptMongoRepository } from '../infrastructure/receipt.mongo.repository';
import { Receipt, ReceiptStatus } from '../domain/receipt.entity';
import { ObjectId } from 'mongodb';
import { getDB } from '../../../config/database';
import { Booking } from '../../bookings/domain/booking.entity';
import { normalizePhone } from '@shared/utils/phone.utils';

export class AtolController {
  constructor(
    private atolService: AtolService,
    private receiptRepository: ReceiptMongoRepository
  ) {}

  /**
   * POST /admin/atol/receipts
   * Создание фискального чека для оплаты на месте
   */
  async createReceipt(req: Request, res: Response) {
    try {
      const { bookingId, paymentType } = req.body;

      if (!bookingId) {
        return res.status(400).json({ error: 'bookingId is required' });
      }

      if (!paymentType || !['cash', 'card'].includes(paymentType)) {
        return res.status(400).json({ error: 'paymentType must be "cash" or "card"' });
      }

      // Получаем бронирование
      const booking = await getDB()
        .collection<Booking>('bookings')
        .findOne({ _id: new ObjectId(bookingId) });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Получаем данные пользователя
      const user = await getDB()
        .collection('users')
        .findOne({ _id: booking.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Получаем данные зала
      const room = await getDB()
        .collection('rooms')
        .findOne({ _id: booking.roomId });

      // Формируем позиции чека
      const items = [];
      
      // Основная услуга - аренда зала
      items.push({
        name: room ? `Аренда зала "${room.name}"` : 'Аренда зала',
        price: booking.totalPrice,
        quantity: 1
      });

      // Если есть оборудование, можно добавить детализацию
      if (booking.equipmentIds && booking.equipmentIds.length > 0) {
        const equipment = await getDB()
          .collection('equipment')
          .find({ _id: { $in: booking.equipmentIds } })
          .toArray();
        
        for (const eq of equipment) {
          items.push({
            name: `Оборудование: ${eq.name}`,
            price: 0, // Цена уже включена в общую сумму
            quantity: 1
          });
        }
      }

      // Создаём запись чека в БД
      const externalId = `booking_${bookingId}_${Date.now()}`;
      const receipt = new Receipt({
        bookingId: booking._id!,
        externalId,
        status: ReceiptStatus.Wait,
        paymentType,
        totalAmount: booking.totalPrice,
        items,
        customerEmail: user.email,
        customerPhone: user.phone ? normalizePhone(user.phone) : undefined,
        customerName: user.fullName
      });

      const savedReceipt = await this.receiptRepository.create(receipt);

      // Отправляем чек в АТОЛ (асинхронно)
      this.processReceipt(savedReceipt._id!, {
        externalId,
        customerEmail: user.email,
        customerPhone: user.phone ? normalizePhone(user.phone) : undefined,
        customerName: user.fullName,
        items,
        paymentType,
        totalAmount: booking.totalPrice
      }).catch(error => {
        console.error('[ATOL] Failed to process receipt:', error);
      });

      // Обновляем бронирование
      await getDB()
        .collection<Booking>('bookings')
        .updateOne(
          { _id: booking._id },
          {
            $set: {
              paymentMethod: paymentType === 'cash' ? 'on_site_cash' : 'on_site_card',
              isPaid: true,
              paidAmount: booking.totalPrice,
              paymentStatus: 'paid',
              status: 'confirmed',
              updatedAt: new Date()
            }
          }
        );

      return res.status(201).json({
        message: 'Receipt created successfully',
        receipt: {
          id: savedReceipt._id,
          externalId: savedReceipt.externalId,
          status: savedReceipt.status,
          totalAmount: savedReceipt.totalAmount
        }
      });
    } catch (error: any) {
      console.error('[ATOL Controller] Error creating receipt:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /admin/atol/receipts/:id
   * Получение статуса чека
   */
  async getReceipt(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const receipt = await this.receiptRepository.findById(new ObjectId(id));

      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      return res.json(receipt);
    } catch (error: any) {
      console.error('[ATOL Controller] Error getting receipt:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /admin/atol/receipts/booking/:bookingId
   * Получение всех чеков для бронирования
   */
  async getReceiptsByBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;

      const receipts = await this.receiptRepository.findByBookingId(new ObjectId(bookingId));

      return res.json(receipts);
    } catch (error: any) {
      console.error('[ATOL Controller] Error getting receipts by booking:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /admin/atol/receipts/:id/refresh
   * Принудительное обновление статуса чека из АТОЛ
   */
  async refreshReceipt(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const receipt = await this.receiptRepository.findById(new ObjectId(id));

      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      if (!receipt.atolUuid) {
        return res.status(400).json({ error: 'Receipt has no ATOL UUID' });
      }

      // Получаем актуальный статус из АТОЛ
      const report = await this.atolService.getReceiptStatus(receipt.atolUuid);

      // Обновляем статус
      if (report.status === 'done' && report.payload) {
        await this.receiptRepository.updateStatus(
          receipt._id!,
          ReceiptStatus.Done,
          {
            fiscalReceiptNumber: report.payload.fiscal_receipt_number,
            shiftNumber: report.payload.shift_number,
            receiptDatetime: report.payload.receipt_datetime,
            fnNumber: report.payload.fn_number,
            ecrRegistrationNumber: report.payload.ecr_registration_number,
            fiscalDocumentNumber: report.payload.fiscal_document_number,
            fiscalDocumentAttribute: report.payload.fiscal_document_attribute,
            fnsSite: report.payload.fns_site,
            ofdInn: report.payload.ofd_inn,
            ofdReceiptUrl: report.payload.ofd_receipt_url
          }
        );
      } else if (report.status === 'fail') {
        await this.receiptRepository.updateStatus(
          receipt._id!,
          ReceiptStatus.Fail,
          undefined,
          report.error?.text
        );
      }

      // Возвращаем обновлённый чек
      const updatedReceipt = await this.receiptRepository.findById(receipt._id!);

      return res.json(updatedReceipt);
    } catch (error: any) {
      console.error('[ATOL Controller] Error refreshing receipt:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Асинхронная обработка чека
   */
  private async processReceipt(receiptId: ObjectId, params: any) {
    try {
      // Создаём чек в АТОЛ
      const atolResponse = await this.atolService.createReceipt(params);

      // Обновляем UUID в БД
      await getDB()
        .collection('receipts')
        .updateOne(
          { _id: receiptId },
          { $set: { atolUuid: atolResponse.uuid, updatedAt: new Date() } }
        );

      // Ждём фискализации (с таймаутом)
      const report = await this.atolService.waitForReceipt(atolResponse.uuid);

      // Обновляем данные после фискализации
      if (report.status === 'done' && report.payload) {
        await this.receiptRepository.updateStatus(
          receiptId,
          ReceiptStatus.Done,
          {
            fiscalReceiptNumber: report.payload.fiscal_receipt_number,
            shiftNumber: report.payload.shift_number,
            receiptDatetime: report.payload.receipt_datetime,
            fnNumber: report.payload.fn_number,
            ecrRegistrationNumber: report.payload.ecr_registration_number,
            fiscalDocumentNumber: report.payload.fiscal_document_number,
            fiscalDocumentAttribute: report.payload.fiscal_document_attribute,
            fnsSite: report.payload.fns_site,
            ofdInn: report.payload.ofd_inn,
            ofdReceiptUrl: report.payload.ofd_receipt_url
          }
        );
      } else if (report.status === 'fail') {
        await this.receiptRepository.updateStatus(
          receiptId,
          ReceiptStatus.Fail,
          undefined,
          report.error?.text
        );
      }
    } catch (error: any) {
      console.error('[ATOL] Receipt processing failed:', error);
      await this.receiptRepository.updateStatus(
        receiptId,
        ReceiptStatus.Fail,
        undefined,
        error.message
      );
    }
  }
}
