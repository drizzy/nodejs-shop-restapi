import { v2 } from 'cloudinary';

const CLOUD_NAME: string = `${process.env.CLOUDINARY_CLOUD_NAME}`
const CLOUD_KEY: string = `${process.env.CLOUDINARY_API_KEY}`
const CLOUD_SECRET: string = `${process.env.CLOUDINARY_API_SECRET}`

v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET
});

const uploadImageCloudinary = async (filePath: any) =>{
 return await v2.uploader.upload(filePath, {
  folder: 'nodeshop'
 });
} 

const deleteImageCloudinary = async (publicId: any) => {
  return await v2.uploader.destroy(publicId);
}

export { uploadImageCloudinary, deleteImageCloudinary };