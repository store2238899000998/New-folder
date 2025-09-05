import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum TransactionType {
  INITIAL_DEPOSIT = 'initial_deposit',
  ROI_PAYMENT = 'roi_payment',
  REINVESTMENT = 'reinvestment',
  WITHDRAWAL = 'withdrawal',
  ADMIN_CREDIT = 'admin_credit',
  ADMIN_DEBIT = 'admin_debit',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
}

@Entity('investment_history')
export class InvestmentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  user_id: string;

  @Column({ type: 'enum', enum: TransactionType })
  transaction_type: TransactionType;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  balance_before: number;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  balance_after: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  transaction_metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.investment_history)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  // Helper methods
  public static createROITransaction(
    userId: string,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    cycleNumber: number
  ): Partial<InvestmentHistory> {
    return {
      user_id: userId,
      transaction_type: TransactionType.ROI_PAYMENT,
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `ROI Payment - Cycle ${cycleNumber}`,
      transaction_metadata: {
        cycle_number: cycleNumber,
        roi_percentage: 8,
        is_automatic: true,
      },
    };
  }

  public static createAdminTransaction(
    userId: string,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    type: TransactionType,
    description: string,
    metadata: any = {}
  ): Partial<InvestmentHistory> {
    return {
      user_id: userId,
      transaction_type: type,
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      transaction_metadata: {
        ...metadata,
        is_admin_action: true,
      },
    };
  }
}
