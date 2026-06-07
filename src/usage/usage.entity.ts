import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';

@Entity('usage_logs')
export class UsageLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tenantId!: string;

  @Column()
  method!: string;

  @Column()
  endpoint!: string;

  @Column()
  statusCode!: number;

  @Column()
  responseTimeMs!: number;

  @Column({ nullable: true })
  apiKeyId!: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @CreateDateColumn()
  createdAt!: Date;
}