import { ViewEntity, ViewColumn, AfterLoad } from "typeorm";
import Security from 'utility-layer/dist/security'
const security = new Security();
@ViewEntity({
  name: 'vw_transportation_v2',
  expression: `
  SELECT listall.id,
    listall.user_id,
    listall.product_type_id,
    listall.product_name,
    listall.truck_type,
    listall.weight,
    listall.required_truck_amount,
    listall.loading_datetime,
    listall."from",
    listall."to",
    listall.owner,
    listall.trips,
    listall.updated_at,
    listall.status,
    listall.tipper,
    listall.price,
    listall.price_type,
    listall.full_text_search
   FROM ( SELECT jc.job_id AS id,
            job.user_id,
            job.product_type_id,
            job.product_name,
            job.truck_type,
            job.weight,
            job.required_truck_amount,
            job.loading_datetime,
            json_build_object('name', job.loading_address, 'dateTime', job.loading_datetime, 'contactName', job.loading_contact_name, 'contactMobileNo', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude)::jsonb AS "from",
            job.shipments AS "to",
            job.owner,
            json_agg(jsonb_build_object('id', trip.id, 'jobCarrierId', jc.id, 'weight', trip.weight, 'price', trip.price, 'status', trip.status, 'createdAt', trip.created_at, 'createdUser', trip.created_user, 'startDate', trip.start_date, 'isDeleted', trip.is_deleted, 'truck', json_build_object('id', trucky.id, 'approveStatus', trucky.approve_status, 'loadingWeight', trucky.loading_weight, 'registrationNumber', trucky.registration_number, 'stallHeight', trucky.stall_height, 'tipper', trucky.tipper, 'truckType', trucky.truck_type, 'createdAt', trucky.created_at, 'updatedAt', trucky.updated_at, 'carrierId', trucky.carrier_id, 'truckPhotos', trucky.truck_photos, 'workZones', trucky.work_zone, 'owner', trucky.owner)))::jsonb AS trips,
            max(trip.updated_at) AS updated_at,
            job.status,
            job.tipper,
            job.price,
            job.price_type,
            job.full_text_search
           FROM job_carrier jc
             LEFT JOIN trip trip ON jc.id = trip.job_carrier_id
             LEFT JOIN dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,status,full_text_search FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, status text, full_text_search text) ON job.id = jc.job_id
             LEFT JOIN dblink('truckserver'::text, 'SELECT id,approve_status,loading_weight,registration_number,stall_height,tipper,truck_type,created_at,updated_at,carrier_id,truck_photos,work_zone,owner FROM vw_truck_details'::text) trucky(id integer, approve_status text, loading_weight double precision, registration_number text[], stall_height text, tipper boolean, truck_type integer, created_at timestamp without time zone, updated_at timestamp without time zone, carrier_id integer, truck_photos jsonb, work_zone jsonb, owner jsonb) ON trip.truck_id = trucky.id
          GROUP BY jc.job_id, job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.loading_address, job.status, job.full_text_search
        UNION ALL
         SELECT job.id,
            job.user_id,
            job.product_type_id,
            job.product_name,
            job.truck_type,
            job.weight,
            job.required_truck_amount,
            job.loading_datetime,
            json_build_object('name', job.loading_address, 'datetime', job.loading_datetime, 'contact_name', job.loading_contact_name, 'contact_mobile_no', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude)::jsonb AS "from",
            job.shipments AS "to",
            job.owner,
            NULL::jsonb AS jsonb,
            NULL::timestamp without time zone AS "timestamp",
            job.status,
            job.tipper,
            job.price,
            job.price_type,
            job.full_text_search
           FROM dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,status,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,full_text_search FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, status text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, full_text_search text)
          WHERE NOT (job.id IN ( SELECT job_carrier.job_id
                   FROM job_carrier))
          GROUP BY job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.loading_address, job.status, job.full_text_search) listall
  GROUP BY listall.id, listall.trips, listall.user_id, listall.loading_datetime, listall.product_type_id, listall.product_name, listall.truck_type, listall.weight, listall.required_truck_amount, listall."to", listall.owner, listall.price, listall.price_type, listall."from", listall.tipper, listall.status, listall.full_text_search, listall.updated_at;`
})
export class VwTransportationV2 {

  @ViewColumn({ name: 'id' })
  id: string

  @ViewColumn({ name: 'user_id' })
  userId: string

  @ViewColumn({ name: 'product_type_id' })
  productTypeId: number

  @ViewColumn({ name: 'product_name' })
  productName: string

  @ViewColumn({ name: 'truck_type' })
  truckType: number

  @ViewColumn({ name: 'weight' })
  weight: number

  @ViewColumn({ name: 'required_truck_amount' })
  requiredTruckAmount: number

  @ViewColumn({ name: "loading_datetime" })
  loadingDatetime: Date | null

  @ViewColumn({ name: 'from' })
  from: {
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
    datetime: string | undefined,
    contact_name: string | undefined,
    contact_mobile_no: string | undefined,
    lat: string,
    lng: string,
  }
  @ViewColumn({ name: 'to' })
  to: Array<{
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
    lat: string,
    lng: string,
  }>

  @ViewColumn({ name: 'owner' })
  owner: {
    id: number
    userId: string
    fullName: string | null
    companyName: string | null
    email: string
    mobileNo: string
    avatar: {
      object: string
    }
  }

  @ViewColumn({ name: 'trips' })
  trips: Array<{
    "id": string | null
    "price": number | null
    "truck": {
      "id": string | null
      "owner": {
        "id": number | null
        "userId": string | null
        "email": string | null
        "avatar": { object: string | null }
        "fullName": string | null
        "mobileNo": string | null
        "companyName": string | null
      }
      "tipper": boolean
      "carrierId": string | null
      "created_at": Date | null
      "truck_type": number
      "updated_at": Date | null
      "workZones": Array<{
        region: number | null
        province: number | null
      }> | null

      "stallHeight": string | null
      "truckPhotos": {
        front: string | null
        back: string | null
        left: string | null
        right: string | null
      } | null
      "approveStatus": "INACTIVE" | "ACTIVE"
      "loadingWeight": number | null
      "registrationNumber": string[]
    }
    "startDate": string
    "isDeleted": boolean
    "status": "OPEN" | "IN_PROGRESS" | "DONE" | "REJECTED"
    "weight": number | null
    "createdAt": Date | null
    "createdUser": string
    "jobCarrierId": number
  }>

  @ViewColumn({ name: 'updated_at' })
  updatedAt: Date | null

  @ViewColumn({ name: 'status' })
  status: "NEW" | "INPROGRESS" | "CANCELLED" | "DONE" | "EXPIRED"


  @ViewColumn({ name: 'tipper' })
  tipper: boolean
  @ViewColumn({ name: 'price' })
  price: number
  @ViewColumn({ name: 'price_type' })
  priceType: string
  @ViewColumn({ name: 'full_text_search' })
  fullTextSearch?: string

  @AfterLoad()
  removeFullTextSearch() {
    delete this.fullTextSearch
  }

  @AfterLoad()
  encodeFields() {
    this.id = security.encodeUserId(+this.id);
    this.owner.userId = security.encodeUserId(+this.owner.id);

    this.from.dateTime = this.from.datetime || ''
    this.from.contactName = this.from?.contact_name || ''
    this.from.contactMobileNo = this.from?.contact_mobile_no || ''
    delete this.from.datetime
    delete this.from.contact_name
    delete this.from.contact_mobile_no

    const tmp = this.trips
    if (tmp && Array.isArray(tmp) && tmp.length > 0)
      tmp.map(e => {
        e.id = e?.id ? security.encodeUserId(+e.id) : null;
        e.truck.id = e?.truck?.id ? security.encodeUserId(+e.truck.id) : null;
        e.truck.carrierId = e?.truck?.carrierId ? security.encodeUserId(+e.truck.carrierId) : null;
        if (e.truck.owner) {
          e.truck.owner.companyName = e?.truck?.owner?.fullName || null
          e.truck.owner.userId = e?.truck?.owner?.id ? security.encodeUserId(+e.truck.owner.id) : null
        }
      })
  }


}
