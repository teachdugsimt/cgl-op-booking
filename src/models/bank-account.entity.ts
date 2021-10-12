import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("bank_account_pkey", ["id"], { unique: true })
@Entity("bank_account", { schema: "public" })
export class BankAccount {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "user_id" })
  userId: number;

  @Column("character varying", { name: "account_name", length: 150 })
  accountName: string;

  @Column("character varying", { name: "account_no", length: 20 })
  accountNo: string;

  @Column("character varying", {
    name: "bank_name",
    nullable: true,
    length: 100,
  })
  bankName: string | null;

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
