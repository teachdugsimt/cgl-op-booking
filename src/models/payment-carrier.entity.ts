import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("payment_carrier_pkey", ["id"], { unique: true })
@Entity("payment_carrier", { schema: "public" })
export class PaymentCarrier {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "trip_id" })
  tripId: number;

  @Column("integer", { name: "bank_account_id", nullable: true })
  bankAccountId: number | null;

  @Column("numeric", { name: "price_per_ton", nullable: true })
  pricePerTon: string | null;

  @Column("numeric", { name: "amount", nullable: true })
  amount: string | null;

  @Column("numeric", { name: "fee_amount", nullable: true })
  feeAmount: string | null;

  @Column("numeric", {
    name: "fee_percentage",
    nullable: true,
    default: () => "1",
  })
  feePercentage: string | null;

  @Column("numeric", { name: "net_amount", nullable: true })
  netAmount: string | null;

  @Column("enum", {
    name: "payment_status",
    nullable: true,
    enum: ["AWAITING", "APPROVED", "REJECTED", "ISSUED", "PAID"],
  })
  paymentStatus:
    | "AWAITING"
    | "APPROVED"
    | "REJECTED"
    | "ISSUED"
    | "PAID"
    | null;

  @Column("date", { name: "payment_date", nullable: true })
  paymentDate: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("timestamp without time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("character varying", {
    name: "created_user",
    nullable: true,
    length: 100,
  })
  createdUser: string | null;

  @Column("character varying", {
    name: "updated_user",
    nullable: true,
    length: 100,
  })
  updatedUser: string | null;

  @Column("boolean", {
    name: "is_deleted",
    nullable: true,
    default: () => "false",
  })
  isDeleted: boolean | null;
}
