import { ViewEntity, ViewColumn, ObjectIdColumn, AfterLoad, AfterInsert, AfterRemove, AfterUpdate } from "typeorm";
import Security from 'utility-layer/dist/security'

const security = new Security();

@ViewEntity({
  name: 'vw_trip_inprogress',
  expression!: `SELECT
	jc.id AS id,
	jc.job_id AS job_id,
	jc.carrier_id AS carrier_id,
	vwjob.product_type_id AS product_type_id,
	vwjob.product_name AS product_name,
	vwjob.price AS price,
	vwjob.price_type AS price_type,
	vwjob.truck_type AS truck_type,
	vwjob.weight AS total_weight,
	vwjob.required_truck_amount AS required_truck_amount,
	JSON_BUILD_OBJECT(
		'name', vwjob.loading_address,
		'dateTime', vwjob.loading_datetime,
		'contactName', vwjob.loading_contact_name,
		'contactMobileNo', vwjob.loading_contact_phone,
		'lat', vwjob.loading_latitude,
		'lng', vwjob.loading_longitude
	) AS from,
	vwjob.shipments AS shipments,
	vwjob.owner AS job_owner,
	JSON_AGG(JSON_BUILD_OBJECT(
		'id', t.id, 
		'truckId', t.truck_id,
		'weight', COALESCE(t.weight, vwtruck.loading_weight), -- loadingWeight
		'price', COALESCE(t.price, vwjob.price), 
		'priceType', t.price_type, 
		'status', t.status, 
		'bookingId', t.booking_id,
		'truckType', vwtruck.truck_type,
		'stallHeight', vwtruck.stall_height,
		'createdAt', vwtruck.created_at,
		'updatedAt', vwtruck.updated_at,
		'approveStatus', vwtruck.approve_status,
		'phoneNumber', vwtruck.owner ->> 'mobileNo',
		'registrationNumber', vwtruck.registration_number,
		'workingZones', vwtruck.work_zone,
		'owner', vwtruck.owner,
		'tipper', vwtruck.tipper
	)) AS trips
		
FROM
	job_carrier jc
	LEFT JOIN trip t ON t.job_carrier_id = jc.id
	LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, price, price_type, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments FROM vw_job_list'::text) vwjob (id INTEGER,
		product_type_id INTEGER,
		product_name TEXT,
		price NUMERIC,
		price_type TEXT,
		truck_type TEXT,
		weight NUMERIC,
		required_truck_amount INTEGER,
		loading_address TEXT,
		loading_datetime TEXT,
		loading_contact_name TEXT,
		loading_contact_phone TEXT,
		loading_latitude TEXT,
		loading_longitude TEXT,
		owner JSONB,
		shipments JSONB) ON vwjob.id = jc.job_id
	LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::TEXT) vwtruck (
		id INTEGER,
		approve_status VARCHAR,
		loading_weight NUMERIC,
		registration_number _TEXT,
		stall_height VARCHAR,
		quotation_number INTEGER,
		tipper BOOLEAN,
		truck_type INTEGER,
		created_at TIMESTAMP,
		updated_at TIMESTAMP,
		carrier_id INTEGER,
		owner JSONB,
		work_zone JSONB) ON vwtruck.id = t.truck_id
GROUP by 
	jc.id,
	jc.job_id,
	jc.carrier_id,
	vwjob.product_type_id,
	vwjob.truck_type,
	vwjob.weight,
	vwjob.required_truck_amount,
	vwjob.loading_address,
	vwjob.loading_datetime,
	vwjob.loading_contact_name,
	vwjob.loading_contact_phone,
	vwjob.loading_latitude,
	vwjob.loading_longitude,
	vwjob.owner,
	vwjob.shipments,
	vwjob.product_name,
	vwjob.price,
	vwjob.price_type;
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
