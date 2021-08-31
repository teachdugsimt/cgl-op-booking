import { ViewEntity, ViewColumn, ObjectIdColumn, AfterLoad, AfterInsert, AfterRemove, AfterUpdate } from "typeorm";
import Security from 'utility-layer/dist/security'

const security = new Security();

@ViewEntity({
  name: 'vw_trip_inprogress',
  expression!: ` SELECT jc.id,
  jc.job_id,
  jc.carrier_id,
  vwjob.product_type_id,
  vwjob.product_name,
  vwjob.price,
  vwjob.price_type,
  vwjob.truck_type,
  vwjob.weight AS total_weight,
  vwjob.required_truck_amount,
  json_build_object('name', vwjob.loading_address, 'dateTime', vwjob.loading_datetime, 'contactName', vwjob.loading_contact_name, 'contactMobileNo', vwjob.loading_contact_phone, 'lat', vwjob.loading_latitude, 'lng', vwjob.loading_longitude) AS "from",
  vwjob.shipments,
  vwjob.owner AS job_owner,
  json_agg(json_build_object('id', t.id, 'truckId', t.truck_id, 'weight', COALESCE(t.weight, vwtruck.loading_weight), 'price', COALESCE(t.price, vwjob.price), 'priceType', t.price_type, 'status', t.status, 'bookingId', t.booking_id, 'truckType', vwtruck.truck_type, 'stallHeight', vwtruck.stall_height, 'createdAt', vwtruck.created_at, 'updatedAt', vwtruck.updated_at, 'approveStatus', vwtruck.approve_status, 'phoneNumber', vwtruck.owner ->> 'mobileNo'::text, 'registrationNumber', vwtruck.registration_number, 'workingZones', vwtruck.work_zone, 'owner', vwtruck.owner, 'tipper', vwtruck.tipper)) AS trips
 FROM job_carrier jc
   LEFT JOIN trip t ON t.job_carrier_id = jc.id
   LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, price, price_type, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments FROM vw_job_list'::text) vwjob(id integer, product_type_id integer, product_name text, price numeric, price_type text, truck_type text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime text, loading_contact_name text, loading_contact_phone text, loading_latitude text, loading_longitude text, owner jsonb, shipments jsonb) ON vwjob.id = jc.job_id
   LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::text) vwtruck(id integer, approve_status character varying, loading_weight numeric, registration_number text[], stall_height character varying, quotation_number integer, tipper boolean, truck_type integer, created_at timestamp without time zone, updated_at timestamp without time zone, carrier_id integer, owner jsonb, work_zone jsonb) ON vwtruck.id = t.truck_id
WHERE t.status = 'IN_PROGRESS'::enum_trip_status
GROUP BY jc.id, jc.job_id, jc.carrier_id, vwjob.product_type_id, vwjob.truck_type, vwjob.weight, vwjob.required_truck_amount, vwjob.loading_address, vwjob.loading_datetime, vwjob.loading_contact_name, vwjob.loading_contact_phone, vwjob.loading_latitude, vwjob.loading_longitude, vwjob.owner, vwjob.shipments, vwjob.product_name, vwjob.price, vwjob.price_type;
  `,
})
export class VwTripInprogress {

  @ObjectIdColumn({ name: 'id' })
  id!: number | string

  @ViewColumn({ name: 'job_id' })
  jobId!: number | string

  @ViewColumn({ name: 'carrier_id' })
  carrierId!: number | string

  @ViewColumn({ name: 'price' })
  price!: number

  @ViewColumn({ name: 'price_type' })
  priceType!: string

  @ViewColumn({ name: 'product_name' })
  productName!: string

  @ViewColumn({ name: 'product_type_id' })
  productTypeId!: number

  @ViewColumn({ name: 'truck_type' })
  truckType!: number

  @ViewColumn({ name: 'total_weight' })
  totalWeight!: number

  @ViewColumn({ name: 'required_truck_amount' })
  requiredTruckAmount!: number

  @ViewColumn({ name: 'from' })
  from!: {
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
    lat: string,
    lng: string,
  }

  @ViewColumn({ name: 'shipments' })
  to!: Array<{
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
    lat: string,
    lng: string,
  }>

  @ViewColumn({ name: 'job_owner' })
  owner!: {
    id: number
    userId?: string
    fullName: string
    companyName: string
    email: string
    mobileNo: string
    avatar: {
      object: string
    }
  }

  @ViewColumn({ name: 'trips' })
  trips!: Array<{
    id: number,
    truckId: number,
    weight: number,
    price: number,
    priceType: string,
    status: string,
    bookingId: number,
    truckType: string,
    stallHeight: string,
    createdAt: Date,
    updatedAt: Date,
    approveStatus: string,
    phoneNumber: string,
    registrationNumber: Array<string>,
    workingZones?: Array<{
      region: number,
      province: number
    }>,
    owner: {
      id: number
      fullName: string
      email: string
      mobileNo: string
      avatar: {
        object: string
      }
    },
    tipper: boolean
  }>

  @AfterLoad()
  encodeFields() {
    // this.id = security.encodeUserId(+this.jobId);
    // this.jobId = security.encodeUserId(+this.jobId);
    // this.carrierId = security.encodeUserId(+this.carrierId);
    this.owner.userId = security.encodeUserId(+this.owner.id);
    if (this.owner?.fullName) {
      this.owner.companyName = this.owner.fullName
    }
  }

}
