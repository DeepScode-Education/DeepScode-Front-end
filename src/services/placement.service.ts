import {
  BASE_URL,
  getAdminToken,
  getToken,
} from "@/integrations/client";


const adminHeaders = () => {

  const token =
    getAdminToken() ||
    getToken();


  return {
    Authorization: `Bearer ${token}`,
  };

};

// GET ALL

export const getPlacements = async () => {

  const res = await fetch(
    `${BASE_URL}/api/placements`,
    {
      headers: adminHeaders(),
    }
  );


  if(!res.ok){
    throw new Error("Failed to fetch placements");
  }


  return res.json();

};




// CREATE

export const createPlacement = async(
  formData:FormData
)=>{

  const res = await fetch(
    `${BASE_URL}/api/placements`,
    {
      method:"POST",
      headers:adminHeaders(),
      body:formData,
    }
  );


  if(!res.ok){
    throw new Error("Failed to create placement");
  }


  return res.json();

};




// UPDATE

export const updatePlacement = async(
  id:string,
  formData:FormData
)=>{

  const res = await fetch(
    `${BASE_URL}/api/placements/${id}`,
    {
      method:"PUT",
      headers:adminHeaders(),
      body:formData,
    }
  );


  if(!res.ok){
    throw new Error("Failed to update placement");
  }


  return res.json();

};




// DELETE

export const deletePlacement = async(
 id:string
)=>{

 const res = await fetch(
  `${BASE_URL}/api/placements/${id}`,
  {
    method:"DELETE",
    headers:adminHeaders(),
  }
 );


 if(!res.ok){
   throw new Error("Failed to delete placement");
 }


 return res.json();

};