import { ViewEntity, ViewColumn, ObjectIdColumn, AfterLoad, AfterInsert, AfterRemove, AfterUpdate } from "typeorm";
import Security from 'utility-layer/dist/security'

const security = new Security();

@ViewEntity({
  name: 'vw_booking',
  expression: ` 
  SELECT book.id,
    book.job_id,
    truck.owner ->> 'fullName'::text AS fullname,
    truck.owner ->> 'avatar'::text AS avatar,
    book.created_at AS booking_datetime,
        CASE
            WHEN book.truck_id = truck.id THEN json_build_object('id', truck.id, 'truck_type', truck.truck_type, 'loading_weight', truck.loading_weight, 'stall_height', truck.stall_height, 'created_at', truck.created_at, 'updated_at', truck.updated_at, 'approve_status', truck.approve_status, 'registration_number', string_to_array(regexp_replace(truck.registration_number, '[}{]', '', 'g'), ','), 'truck_photos', truck.truck_photos, 'work_zone', truck.work_zone, 'tipper', truck.tipper, 'owner', truck.owner)
            ELSE COALESCE('{}'::json)
        END AS truck
   FROM booking book
     LEFT JOIN dblink('truckserver'::text, 'SELECT id,truck_type,loading_weight,stall_height,created_at,updated_at,approve_status,registration_number,truck_photos,work_zone,tipper,owner FROM vw_truck_details'::text) truck(id integer, truck_type integer, loading_weight double precision, stall_height text, created_at timestamp without time zone, updated_at timestamp without time zone, approve_status text, registration_number text, truck_photos jsonb, work_zone jsonb, tipper boolean, owner jsonb) ON truck.id = book.truck_id
  GROUP BY book.id, truck.id, truck.truck_type, truck.loading_weight, truck.stall_height, truck.created_at, truck.updated_at, truck.approve_status, truck.registration_number, truck.truck_photos, truck.work_zone, truck.tipper, truck.owner;
  `,
})
export class VwBooking {

  @ObjectIdColumn({ name: 'id' })
  id: number | string

  // @ViewColumn({ name: 'job_id' })
  // jobId: number | string

  @ViewColumn({ name: 'fullname' })
  fullName: string

  @ViewColumn({ name: 'avatar' })
  avatar: {
    object: string | null
    totken?: string | null
  }

  @ViewColumn({ name: 'product_type_id' })
  bookingDatetime: Date




  @ViewColumn({ name: 'truck' })
  truck: {
    id: string
    truckType: number
    loadingWeight: number
    stallHeight: string | null
    createdAt: Date | null
    updatedAt: Date | null
    approveStatus: string
    registrationNumber: Array<string>
    truckPhotos: {
      front: string | null
      back: string | null
      left: string | null
      right: string | null
    } | null
    workZone: Array<{ region: number | undefined, province?: number | undefined }>
    tipper: false
    owner: {
      id: number
      userId: string
      companyName: string | undefined
      fullName: string | undefined
      mobileNo: string | undefined
      email: string | undefined
      avatar: {
        object: string | undefined
      } | undefined
    }
  }

  @AfterLoad()
  encodeFields() {
    this.id = security.encodeUserId(+this.id);
    this.truck.owner.companyName = this.truck.owner.fullName || ''
    // this.jobId = security.encodeUserId(+this.jobId);
  }

}
