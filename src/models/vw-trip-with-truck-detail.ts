import { ViewEntity, ViewColumn, ObjectIdColumn } from "typeorm";

@ViewEntity({
  name: 'vw_trip_with_truck_detail',
  expression!: `SELECT
	jc.id AS job_carrier_id,
	jc.job_id AS job_id,
	jc.carrier_id AS carrier_id,
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
	LEFT JOIN dblink('jobserver'::text, 'SELECT id, offered_total AS price FROM job'::text) vwjob (id INTEGER, price NUMERIC) ON vwjob.id = jc.job_id
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
	jc.carrier_id;
  `,
})
export class VwTripWithTruckDetail {

  @ObjectIdColumn({ name: 'job_carrier_id' })
  jobCarrierId!: number | string

  @ViewColumn({ name: 'job_id' })
  jobId!: number | string

  @ViewColumn({ name: 'carrier_id' })
  carrierId!: number | string

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

}
