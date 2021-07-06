import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("booking_pkey", ["id"], { unique: true })
@Entity("booking", { schema: "public" })
export class Booking {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "truck_id", nullable: true })
  truckId: number | null;

  @Column("integer", { name: "job_id", nullable: true })
  jobId: number | null;

  @Column("enum", {
    name: "requester_type",
    nullable: true,
    enum: ["JOB_OWNER", "TRUCK_OWNER"],
  })
  requesterType: "JOB_OWNER" | "TRUCK_OWNER" | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["WAITING", "ACCEPTED", "REJECTED"],
  })
  status: "WAITING" | "ACCEPTED" | "REJECTED" | null;

  @Column("integer", { name: "requester_user_id" })
  requesterUserId: number;

  @Column("integer", { name: "accept_user_id" })
  acceptUserId: number;

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
}
