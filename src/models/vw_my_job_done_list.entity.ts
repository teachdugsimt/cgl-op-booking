import { ViewEntity, ViewColumn, AfterLoad } from "typeorm";
import Security from 'utility-layer/dist/security'
const security = new Security();
@ViewEntity({
  name: 'vw_my_job_done_list',
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
    listall.job_status,
    listall.status,
    listall.requester_type,
    listall.requester_user_id,
    listall.accepter_user_id,
    listall.price,
    listall.price_type
   FROM ( SELECT job.id,
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
            job.status AS job_status,
            book.status,
            book.requester_type,
            book.requester_user_id,
            book.accepter_user_id,
            job.price,
            job.price_type
           FROM booking book
             LEFT JOIN dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,price,price_type,owner,shipments,status FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, price numeric, price_type text, owner jsonb, shipments jsonb, status text) ON job.id = book.job_id
          GROUP BY book.id, job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.status, job.loading_address
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
            job.status AS job_status,
            NULL::booking_status AS booking_status,
            NULL::booking_requester_type AS booking_requester_type,
            NULL::integer AS int4,
            NULL::integer AS int4,
            job.price,
            job.price_type
           FROM dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,price,price_type,owner,shipments,status FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, price numeric, price_type text, owner jsonb, shipments jsonb, status text)
          WHERE NOT (job.id IN ( SELECT booking.job_id
                   FROM booking))
          GROUP BY job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.status, job.loading_address) listall
  GROUP BY listall.id, listall.user_id, listall.loading_datetime, listall.product_type_id, listall.product_name, listall.truck_type, listall.weight, listall.required_truck_amount, listall."to", listall.owner, listall.status, listall.requester_type, listall.requester_user_id, listall.accepter_user_id, listall.price, listall.price_type, listall."from", listall.job_status;
  `
})
export class VwMyJobDoneList {

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
    fullName: string
    email: string
    mobileNo: string
    avatar: {
      object: string
    }
  }


  @ViewColumn({ name: 'job_status' })
  jobStatus: string
  @ViewColumn({ name: 'status' })
  status: string
  @ViewColumn({ name: 'requester_type' })
  requesterType: number
  @ViewColumn({ name: 'requester_user_id' })
  requesterUserId: number
  @ViewColumn({ name: 'accepter_user_id' })
  accepterUserId: number

  @ViewColumn({ name: 'price' })
  price: number
  @ViewColumn({ name: 'price_type' })
  priceType: string

  @AfterLoad()
  encodeFields() {
    this.id = security.encodeUserId(+this.id);
    // this.jobId = security.encodeUserId(+this.jobId);
    // this.carrierId = security.encodeUserId(+this.carrierId);
    this.owner.userId = security.encodeUserId(+this.owner.id);
  }

}
