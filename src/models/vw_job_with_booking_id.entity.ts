import { ViewEntity, ViewColumn, AfterLoad } from "typeorm";
import Security from 'utility-layer/dist/security'
const security = new Security();
@ViewEntity({
  name: 'vw_job_with_booking_id',
  expression: `
  SELECT job.id,
  book.id AS booking_id,
  job.product_type_id,
  job.product_name,
  job.truck_type,
  job.weight,
  job.required_truck_amount,
  json_build_object('name', job.loading_contact_name, 'datetime', job.loading_datetime, 'contact_name', job.loading_contact_name, 'contact_mobile_no', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude) AS "from",
  job.shipments AS "to",
  job.owner,
  job.quotations,
  book.status,
  book.requester_type,
  book.requester_user_id,
  book.accepter_user_id,
  job.price,
  job.price_type
 FROM booking book
   LEFT JOIN dblink('jobserver'::text, 'SELECT id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,price,price_type,owner,shipments,quotations FROM vw_job_list'::text) job(id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, price numeric, price_type text, owner jsonb, shipments jsonb, quotations jsonb) ON job.id = book.job_id
GROUP BY book.id, job.id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.quotations;
  `
})
export class VwJobWithBookingId {

  @ViewColumn({ name: 'id' })
  id: string

  @ViewColumn({ name: 'product_type_id' })
  productTypeId: number

  @ViewColumn({ name: 'product_name' })
  productName: string

  @ViewColumn({ name: 'truck_type' })
  truckType: number | string

  @ViewColumn({ name: 'weight' })
  weight: number

  @ViewColumn({ name: 'required_truck_amount' })
  requiredTruckAmount: number

  @ViewColumn({ name: 'from' })
  from: {
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
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
    companyName: string | null
    fullName: string
    email: string
    mobileNo: string
    avatar: {
      object: string
    }
  }

  @ViewColumn({ name: 'quotations' })
  quotations: Array<{
    "id": string
    "fullName": string | null
    "avatar": { object: string | null }
    "truck": {
      "id": string
      "owner": {
        "id": number | null
        "userId": string
        "email": string | null
        "avatar": { object: string | null }
        "fullName": string | null
        "mobileNo": string | null
        "companyName": string | null
      }
      "tipper": boolean
      "work_zone": Array<{
        region: number | null
        province: number | null
      }> | null
      "created_at": Date
      "truck_type": number
      "updated_at": Date
      "stall_height": string | null
      "truck_photos": {
        front: string | null
        back: string | null
        left: string | null
        right: string | null
      } | null
      "approve_status": "INACTIVE" | "ACTIVE"
      "loading_weight": number | null
      "registration_number": string[]
    }
    "bookingDatetime": Date
  }>

  // @ViewColumn({ name: 'status' })
  // status: string
  // @ViewColumn({ name: 'requester_type' })
  // requesterType: number
  // @ViewColumn({ name: 'requester_user_id' })
  // requesterUserId: number
  // @ViewColumn({ name: 'accepter_user_id' })
  // accepterUserId: number

  @ViewColumn({ name: 'price' })
  price: number
  @ViewColumn({ name: 'price_type' })
  priceType: string

  @AfterLoad()
  encodeFields() {
    this.id = security.encodeUserId(+this.id);
    this.owner.userId = security.encodeUserId(+this.owner.id);
    const tmp = this.quotations
    if (this.truckType) this.truckType = this.truckType.toString()
    if (this.from.lat) this.from.lat = this.from.lat.toString()
    if (this.from.lng) this.from.lng = this.from.lng.toString()
    this.owner.companyName = this.owner.fullName || ''
    if (tmp && Array.isArray(tmp) && tmp.length > 0)
      tmp.map(e => {
        e.id = e.id ? security.encodeUserId(+e.id) : '';
        e.truck.id = e.truck.id ? security.encodeUserId(+e.truck.id) : '';
        e.truck.owner.companyName = e.truck.owner.fullName || ''
        e.truck.owner.userId = e.truck.owner.id ? security.encodeUserId(+e.truck.owner.id) : ''
      })

  }

}
