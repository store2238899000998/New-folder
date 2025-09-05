import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  ticket_id: string;

  @Column({ type: 'bigint' })
  user_id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'text', nullable: true })
  admin_response: string;

  @Column({ type: 'bigint', nullable: true })
  responded_by: string;

  @Column({ type: 'datetime', nullable: true })
  responded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.support_tickets)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  // Helper methods
  public isOpen(): boolean {
    return this.status === TicketStatus.OPEN;
  }

  public isInProgress(): boolean {
    return this.status === TicketStatus.IN_PROGRESS;
  }

  public isClosed(): boolean {
    return this.status === TicketStatus.CLOSED;
  }

  public respond(adminId: string, response: string): void {
    this.admin_response = response;
    this.responded_by = adminId;
    this.responded_at = new Date();
    this.status = TicketStatus.CLOSED;
  }

  public setInProgress(): void {
    this.status = TicketStatus.IN_PROGRESS;
  }

  public close(): void {
    this.status = TicketStatus.CLOSED;
  }
}
