import fs from 'fs';
import { pool } from "../config/psql";
import { deleteImageCloudinary } from '../config/cloudinary'

const insertImage = async (productId: number, urls: any) => {
  
  const query = 'INSERT INTO products_image (product_id, secure_url, public_id) VALUES ($1, $2, $3);';

  try {

    await Promise.all(

      urls.map(async (image: any) => {

        const values = [productId, image.secure_url, image.public_id];
        await pool.query(query, values);

      })

    );

  } catch (e) {
    console.error('Error inserting images into database:', e);
    throw e;
  }

}

const deleteImage = async (publicIds: any, productIds: number[]) => {

  try {

    const deleteImagePromises = publicIds.rows.map((image: any) => deleteImageCloudinary(image.public_id));

    await Promise.all(deleteImagePromises);

    const response = await pool.query('DELETE FROM products_image WHERE product_id = ANY($1) RETURNING *;', [productIds]);

    return response;

  } catch (e) {
    console.error('Error deleting images: ', e);
    throw e;
  }
  
};

const deleteTempImages = (filePaths: any) => {

  fs.unlink( filePaths, (e) => {
    if (e) {
      console.error(`Error deleting temporary image: ${filePaths}`, e);
    } else {
      console.log(`Deleted temporary image: ${filePaths}`);
    }
  })

}

export  { insertImage, deleteImage, deleteTempImages };