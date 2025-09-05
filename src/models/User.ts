import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { InvestmentHistory } from './InvestmentHistory';
import { SupportTicket } from './SupportTicket';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true })
  user_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  initial_balance: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  current_balance: number;

  @Column({ type: 'int', default: 0 })
  roi_cycles_completed: number;

  @Column({ type: 'int', default: 4 })
  max_roi_cycles: number;

  @Column({ type: 'timestamp', nullable: true })
  next_roi_date: Date;

  @Column({ type: 'boolean', default: false })
  can_withdraw: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => InvestmentHistory, history => history.user)
  investment_history: InvestmentHistory[];

  @OneToMany(() => SupportTicket, ticket => ticket.user)
  support_tickets: SupportTicket[];

  // Helper methods
  public canWithdrawNow(): boolean {
    return this.roi_cycles_completed >= this.max_roi_cycles && this.can_withdraw;
  }

  public getNextROIAmount(): number {
    return (this.initial_balance * 8) / 100; // 8% of initial balance
  }

  public isROIDue(): boolean {
    if (!this.next_roi_date) return false;
    return new Date() >= this.next_roi_date;
  }

  public updateROICycle(): void {
    this.roi_cycles_completed += 1;
    this.current_balance += this.getNextROIAmount();
    
    // Set next ROI date (7 days from now)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    this.next_roi_date = nextDate;

    // Enable withdrawal after 4 cycles
    if (this.roi_cycles_completed >= this.max_roi_cycles) {
      this.can_withdraw = true;
    }
  }
}
