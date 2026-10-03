export interface CloudinaryFile {
  url: string;
  publicId: string;
}


export interface PlacementStudent {

  _id: string;

  name: string;

  role: string;

  company: string;


  image: CloudinaryFile;


  offerLetter: CloudinaryFile;


  placementYear: string;


  displayOrder: number;


  isActive: boolean;


  createdAt: string;

  updatedAt: string;

}



export interface PlacementListResponse {

  success: boolean;

  count: number;

  data: PlacementStudent[];

}



export interface PlacementResponse {

  success: boolean;

  message?: string;

  data: PlacementStudent;

}