import { BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("payment_pkey", ["id"], { unique: true })
@Entity("payment", { schema: "public" })
export class Payment {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "trip_id" })
  tripId: number;
}
