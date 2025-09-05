import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('access_codes')
export class AccessCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  initial_balance: number;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @Column({ type: 'bigint', nullable: true })
  used_by: string;

  @Column({ type: 'datetime', nullable: true })
  used_at: Date;

  @Column({ type: 'bigint', nullable: true })
  preassigned_user_id: string;

  @Column({ type: 'datetime', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Helper methods
  public isExpired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  public isValid(): boolean {
    return !this.is_used && !this.isExpired();
  }

  public use(userId: string): void {
    this.is_used = true;
    this.used_by = userId;
    this.used_at = new Date();
  }
}
