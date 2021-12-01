export interface PostBooking {
  jobId: string
  truckId: string
  requesterType: "JOB_OWNER" | "TRUCK_OWNER" | null
  accepterUserId: string
}
export interface PostBookingLine {
  jobId: string
  truckId?: string
  requesterType: "JOB_OWNER" | "TRUCK_OWNER" | null
  accepterUserId: string
  requesterUserId: string
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

export interface IJob {
  id: string;
  userId: string;
  productTypeId: number; //? -1 is null.
  productName: string;
  truckType: string; //? should be number if mobx parse error, check here
  weight: number;
  requiredTruckAmount: number;
  loadingDatetime: string;
  from: IFromDestination;
  to: IDestination[];
  owner: IOwner;
  trips: ITrips[];
  status: 'NEW' | 'INPROGRESS' | 'CANCELLED' | 'DONE' | 'EXPIRED';
  tipper: boolean;
  price: number | string;
  priceType: 'PER_TRIP' | 'PER_TON';
  createdAt: string | null;
}


export interface IDestination {
  name: string | null;
  dateTime: string | null;
  contactName: string | null;
  contactMobileNo: string | null;
  lat: string;
  lng: string;
}

export interface IFromDestination {
  name: string | null;
  dateTime: string | null;
  contactName: string | null;
  contactMobileNo: string | null;
  lat: number;
  lng: number;
}

export interface ITrips {
  id: string;
  price: number | null;
  truck: ITruck2;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'REJECTED';
  weight: number | null;
  createdAt: string | null;
  createdUser: string | null;
  jobCarrierId: number | null;
}

export interface ITruck2 {
  id: string | null;
  owner: {
    id: number;
    email: string | null;
    avatar: {
      object: string | null;
    } | null;
    fullName: string | null;
    mobileNo: string | null;
    companyName: string | null;
    userId: string | null;
  } | null;
  tipper: boolean;
  carrierId: string | null;
  createdAt: string | null;
  truckType: number | null;
  updatedAt: string | null;
  workZones: Array<{
    region: number;
    province?: number | null;
  }> | null;
  stallHeight: string | null;
  truckPhotos: {
    front?: { object?: string | null } | null;
    back?: { object?: string | null } | null;
    left?: { object?: string | null } | null;
    right?: { object?: string | null } | null;
  } | null;
  approveStatus: 'INACTIVE' | 'ACTIVE';
  loadingWeight: number | null;
  registrationNumber: string[] | null;
}


export interface IOwner {
  id: number;
  userId: string;
  fullName: string | null;
  email: string | null;
  mobileNo: string;
  avatar: {
    //? infer
    object: string | null;
  };
}
