import AuthenticatedRequest from '../../interface/AuthenticatedRequest';
import { Response } from 'express';
import { pool } from '../../config/psql';
import { Products } from './products.interface';
import slugify from 'slugify';
import { sendRequest, httpError } from '../../utils/handleStatus';
import { uploadImageCloudinary } from '../../config/cloudinary';
import { insertImage, deleteImage, deleteTempImages } from '../../utils/handleImages';

const show = async (req: AuthenticatedRequest, res: Response) => {

  const id: number = parseInt(req.params.id);

  try {

    const query = `SELECT 
                      products.id, 
                      products.name,
                      users.username,
                      products.slug, 
                      products.description, 
                      products.stock,
                      to_char(price, '9999999999.00') AS price,
                      products.category,
                      brands.name AS brand, 
                      json_agg(json_build_object('is_primary', products_image.is_primary, 'url', products_image.secure_url)) AS product_images
                    FROM 
                      products 
                    JOIN 
                      brands 
                    ON 
                      products.brand_id = brands.id 
                    JOIN 
                      products_image 
                    ON 
                      products.id = products_image.product_id 
                    JOIN 
                      users  
                    ON
                      products.user_id = users.id
                    WHERE 
                      products.is_active = true AND products.id = $1
                    GROUP BY 
                      products.id, 
                      brands.name, 
                      products.name,
                      users.username,
                      products.slug,
                      products.description, 
                      products.stock, 
                      products.price,
                      products.category`

    const response = await pool.query(query, [id]);

    
    const products: Array<Products> = response.rows;
    
    if(products == undefined || products.length === 0 ) return httpError(res, 404, `Product with ${id} not found.`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, products);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error');
  }

}

const showSlug = async (req: AuthenticatedRequest, res: Response) => {

  const slug: string = req.params.slug;

  const id: number = parseInt(req.params.id);

  try {

    const query = `SELECT 
                      products.id, 
                      products.name,
                      users.username,
                      products.slug, 
                      products.description, 
                      products.stock,
                      to_char(price, '9999999999.00') AS price,
                      products.category,
                      brands.name AS brand, 
                      json_agg(json_build_object('is_primary', products_image.is_primary, 'url', products_image.secure_url)) AS product_images
                    FROM 
                      products 
                    JOIN 
                      brands 
                    ON 
                      products.brand_id = brands.id 
                    JOIN 
                      products_image 
                    ON 
                      products.id = products_image.product_id 
                    JOIN 
                      users  
                    ON
                      products.user_id = users.id
                    WHERE 
                      products.is_active = true AND products.slug = $1 AND products.id = $2
                    GROUP BY 
                      products.id, 
                      brands.name, 
                      products.name,
                      users.username,
                      products.slug,
                      products.description, 
                      products.stock, 
                      products.price,
                      products.category`

    const response = await pool.query(query, [slug, id]);

    const products: Array<Products> = response.rows;
    
    if(products == undefined || products.length === 0 ) return httpError(res, 404, `Product with ${slug} not found.`);

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, products);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error');
  }

}

const showAll = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const query = `
                  SELECT
                    products.id,
                    products.name,
                    products.slug,
                    products.description,
                    products.stock,
                    TRIM(to_char(products.price, '9999999999.00')) AS price,
                    products.category,
                    users.username,
                    brands.name AS brand,
                    json_agg(json_build_object('is_primary', products_image.is_primary, 'url', products_image.secure_url)) AS product_images
                  FROM
                    products
                  JOIN
                    brands
                  ON
                    products.brand_id = brands.id
                  JOIN 
                    products_image 
                  ON 
                    products.id = products_image.product_id
                  JOIN
                    users  
                  ON
                   products.user_id = users.id
                  WHERE 
                    products.is_active = true
                  GROUP BY
                    products.id,
                    brands.name,
                    products.name,
                    products.slug,
                    products.description,
                    products.stock, 
                    products.price,
                    products.category,
                    users.username
                  `;

    const response = await pool.query(query);

    const products: Array<Products> = response.rows;

    if(!products) return httpError(res, 404, 'Products not found.');

    sendRequest(res, 200, 'Success', `Result: ${response.rowCount}`, products);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error');
  }
  
}

const create = async (req: AuthenticatedRequest, res: Response) => {

  const user = req.user;
  
  const { name, description, stock, price, category, brand_id } = req.body;

  const slug = slugify(name, {lower: true});

  try {

    const query = 'INSERT INTO products (name, description, stock, price, category, brand_id, user_id, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;';

    const value = [name, description, stock, price, category, brand_id, user.id, slug];

    const response = await pool.query(query, value);

    const productId = response.rows[0].id;

    if(productId === undefined) return httpError(res, 500, 'Internal Server Error');

    const filesArray = (req.files as Express.Multer.File[]);
  
    const urls = await Promise.all(
      filesArray.map(async (file) => {
        const result = await uploadImageCloudinary(file.path);
        const tempImage = file.path;
        deleteTempImages(tempImage);
        return {
          public_id: result.public_id,
          secure_url: result.secure_url
        }
      })
    );
  
    await insertImage(productId, urls);

    const product = { id: productId, user_id: user.id, name, slug, description, stock, price, category, brand_id, images: urls };

    sendRequest(res, 201, 'Created', `Result: ${response.rowCount}`, product);

  } catch (e) {
    console.log(e);
    httpError(res, 500, 'Internal Server Error: ');
  }
  
}

const update = async (req: AuthenticatedRequest, res: Response) => {

  const user = req.user;

  const id: number = parseInt(req.params.id);

  const { name, description, stock, price, category, brand_id } = req.body;

  const slug = slugify(name, {lower: true});
  
  try {

    const productResponse = await pool.query('SELECT * FROM products WHERE id = $1 AND user_id = $2;', [id, user.id]);

    if(productResponse.rowCount === 0) return httpError(res, 400, 'The product to update was not found.');

    const productImagesResponse = await pool.query('SELECT * FROM products_image WHERE product_id = $1;', [id]);

    const currentProductImages = productImagesResponse.rows;

    const filesArray = (req.files as Express.Multer.File[]) || [];
    const hasNewImages = filesArray.length > 0;

    const newImagesUrls = await Promise.all(
      filesArray.map(async (file) => {
        const result = await uploadImageCloudinary(file.path);
        const tempImage = file.path;
        deleteTempImages(tempImage);
        return {
          public_id: result.public_id,
          secure_url: result.secure_url
        };
      })
    );

    if (hasNewImages) {
      await insertImage(id, newImagesUrls);
    }

    const query = 'UPDATE products SET name = $1, slug = $2, description = $3, stock = $4, price = $5, category = $6, brand_id = $7, update_at = $8 WHERE id = $9 AND user_id = $10 RETURNING *;';

    const values = [name, slug, description, stock, price, category, brand_id, new Date(), id, user.id];

    const response = await pool.query(query, values);

    if(response.rowCount === 0) return httpError(res, 400, 'The product to update was not found.');

    const product = { id, user_id: user.id, name, slug, description, stock, price, category, brand_id,
       images: hasNewImages ? newImagesUrls : currentProductImages,
      };

    sendRequest(res, 200, 'Updated', `Product with id ${id} updated successfully.`, product)

  } catch (e) {
    httpError(res, 500, 'Internal Server Error');
  }
  
}

const destroy = async (req: AuthenticatedRequest, res: Response) => {

  const user = req.user;
  
  const id: number = parseInt(req.params.id);

  try {

    const publicIds = await pool.query('SELECT public_id FROM products_image WHERE product_id = $1;', [id]);

    await deleteImage(publicIds, [id]);

    const response = await pool.query('DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *;', [id, user.id]);

    if(response.rowCount === 0) return httpError(res, 404, `The product to delete was not found.`);

    const product: Products = response.rows[0];

    sendRequest(res, 200, 'Removed', `Product ${product.name} removed successfully`);

  } catch (e) {
    httpError(res, 500, 'Internal Server Error');
  }
  
}

export default { show, showSlug, showAll, create, update, destroy };