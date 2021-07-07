import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("job_carrier_pkey", ["id"], { unique: true })
@Entity("job_carrier", { schema: "public" })
export class JobCarrier {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "job_id" })
  jobId: number;

  @Column("integer", { name: "carrier_id" })
  carrierId: number;
}
