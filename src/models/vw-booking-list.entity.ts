import { ViewEntity, ViewColumn, AfterLoad } from "typeorm";
import Security from 'utility-layer/dist/security'
const security = new Security();
@ViewEntity({
  name: 'vw_booking_list',
  expression: `SELECT
    job.id,
    book.id AS booking_id,
    job.product_type_id,
    job.product_name,
    job.truck_type,
    json_build_object('id', usr_accepter.id, 'fullName', usr_accepter.fullname, 'email', usr_accepter.email, 'mobileNo', usr_accepter.phone_number, 'avatar', json_build_object('object', usr_accepter.avatar)) AS accepter_profile,
    json_build_object('id', usr_requester.id, 'fullName', usr_requester.fullname, 'email', usr_requester.email, 'mobileNo', usr_requester.phone_number, 'avatar', json_build_object('object', usr_requester.avatar)) AS requester_profile,
    book.status,
    book.requester_type,
    book.requester_user_id,
    book.accepter_user_id
  FROM
    booking book
    LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, truck_type FROM job'::text) job (id integer,
      product_type_id integer,
      product_name text,
      truck_type integer) ON job.id = book.job_id
    LEFT JOIN dblink('userserver', 'select id, fullname, email, phone_number, avatar from user_profile'::TEXT) usr_accepter(
      id INTEGER,
      fullname VARCHAR,
      email VARCHAR,
      phone_number VARCHAR,
      avatar VARCHAR) ON usr_accepter.id = book.accepter_user_id
    LEFT JOIN dblink('userserver', 'select id, fullname, email, phone_number, avatar from user_profile'::TEXT) usr_requester(
      id INTEGER,
      fullname VARCHAR,
      email VARCHAR,
      phone_number VARCHAR,
      avatar VARCHAR) ON usr_requester.id = book.requester_user_id
  GROUP BY
    book.id,
    job.id,
    job.product_type_id,
    job.product_name,
    job.truck_type,
    usr_accepter.id,
    usr_accepter.fullname,
    usr_accepter.email,
    usr_accepter.phone_number,
    usr_accepter.avatar,
    usr_requester.id,
    usr_requester.fullname,
    usr_requester.email,
    usr_requester.phone_number,
    usr_requester.avatar;`
})
export class VwBookingList {

  @ViewColumn({ name: 'id' })
  id: string | number

  @ViewColumn({ name: 'job_id' })
  jobId: string

  @ViewColumn({ name: 'product_type_id' })
  productTypeId: number

  @ViewColumn({ name: 'product_name' })
  productName: string

  @ViewColumn({ name: 'truck_type' })
  truckType: number | string

  @ViewColumn({ name: 'accepter_profile' })
  accepterProfile: {
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

  @ViewColumn({ name: 'requester_profile' })
  requesterProfile: {
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

  @ViewColumn({ name: 'status' })
  status: string

  @ViewColumn({ name: 'requester_type' })
  requesterType: string

  @ViewColumn({ name: 'requester_user_id' })
  requesterUserId: number | string

  @ViewColumn({ name: 'accepter_user_id' })
  accepterUserId: number | string

  @AfterLoad()
  encodeFields() {
    this.id = security.encodeUserId(+this.id);
    this.jobId = security.encodeUserId(+this.jobId);
    this.requesterUserId = security.encodeUserId(+this.requesterUserId);
    this.accepterUserId = security.encodeUserId(+this.accepterUserId);
    this.requesterProfile.userId = security.encodeUserId(+this.requesterProfile.id);
    this.accepterProfile.userId = security.encodeUserId(+this.accepterProfile.id);
  }
}
