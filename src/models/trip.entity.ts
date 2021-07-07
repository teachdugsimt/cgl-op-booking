import { BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("trip_pkey", ["id"], { unique: true })
@Entity("trip", { schema: "public" })
export class Trip {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "job_carrier_id" })
  jobCarrierId: number;

  @Column("integer", { name: "truck_id" })
  truckId: number;

  @Column("numeric", { name: "weight", nullable: true })
  weight: string | null;

  @Column("numeric", { name: "price", nullable: true })
  price: string | null;

  @Column("enum", {
    name: "price_type",
    nullable: true,
    enum: ["PER_TON", "PER_TRIP"],
    default: () => "'PER_TRIP'",
  })
  priceType: "PER_TON" | "PER_TRIP" | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["OPEN", "IN_PROGRESS", "DONE", "REJECTED"],
    default: () => "'OPEN'",
  })
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "REJECTED" | null;

  @Column("integer", { name: "booking_id" })
  bookingId: number;

  @Column("integer", { name: "version", default: () => "0" })
  version: number;

  @Column("timestamp without time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp without time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @Column("character varying", {
    name: "created_user",
    nullable: true,
    length: 254,
    default: () => "NULL::character varying",
  })
  createdUser: string | null;

  @Column("character varying", {
    name: "updated_user",
    nullable: true,
    length: 254,
    default: () => "NULL::character varying",
  })
  updatedUser: string | null;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  updateDateTime() {
    console.log('BeforeInsert BeforeUpdate')
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  createDateTime() {
    console.log('BeforeInsert')
    this.createdAt = new Date();
  }
}
