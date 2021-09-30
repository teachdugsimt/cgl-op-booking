export interface PostBooking {
  jobId: string
  truckId: string
  requesterType: "JOB_OWNER" | "TRUCK_OWNER" | null
  accepterUserId: string
}

export interface FullPostBooking {
  jobId: number
  truckId: number
  requesterType: "JOB_OWNER" | "TRUCK_OWNER" | null
  requesterUserId: number
  accepterUserId: number
}


export interface MyJobFilterList {
  descending?: boolean | undefined
  page?: number | string
  rowsPerPage?: number | string
  sortBy?: string | undefined
  type?: number
  where?: any
  searchText?: string | null
}


export interface Transportation {
  descending?: boolean | undefined
  page?: number | string
  rowsPerPage?: number | string
  sortBy?: string | undefined
  type?: number
  realPage?: number
  realTake?: number
  searchText?: string | undefined | null
  where?: any
}

export interface FullUpdateBooking {
  id: number, // quotation ID
  status: string,
  accepterUserId: number
}

export interface PramsFindMyJob {
  take: number
  skip: number
  where: any
  order: any,
}
