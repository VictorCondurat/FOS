// ProductController.ts
import { IncomingMessage, ServerResponse } from 'http';
import https from 'https';

interface ProductDetail {
  code: string;
  product_name: string;
  image_url: string;
  allergens: string;
  nutrition_grade: string;
  brands: string;
  labels: string;
  countries: string;
  manufacturing_places: string;
  categories: string;
  ingredients_text: string;
  nutrient_levels: Record<string, string>;
  nutriments: Record<string, string>;
  additives_n: number;
  additives: string;
}


export class ProductController {
  public static getProducts(req: IncomingMessage, res: ServerResponse): void {
    const page: number = Number(new URL(req.url as string, `http://${req.headers.host}`).searchParams.get('page')) || 1;
    const url: string = `https://world.openfoodfacts.org/api/v2/search?&page=${page}`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const parsedData = JSON.parse(data);
        const responseData = {
          page_count: Math.ceil(parsedData.count / parsedData.page_size),
          products: parsedData.products.map((product: any) => ({
            id: product._id,
            product_name: product.product_name,
            image_url: product.image_url
          }))
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      });

    }).on('error', (err) => {
      console.log("Error: " + err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    });
  }
  public static async getProductDetail(req: IncomingMessage, res: ServerResponse, productId: string): Promise<void> {
    try {
      const productDetail = await fetchProductDetail(productId);
      if (productDetail) {
        const html = generateProductDetailHTML(productDetail);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Product not found' }));
      }
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}
function generateProductDetailHTML(productDetail: ProductDetail): string {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productDetail.product_name} Detail</title>
  <link rel="stylesheet" href="./styles/product.css">
</head>
<body>
  <div class="container">
    <div class="header">${productDetail.product_name} Detail</div>
    <div id="productDetailContainer">
      <div class="product-info">
        <div class="product-img">
          <img id="productImage" src="${productDetail.image_url}" alt="${productDetail.product_name}">
        </div>
        <div class="product-details">
          <h1 id="productName">${productDetail.product_name}</h1>
          <p>Allergens: ${productDetail.allergens}</p>
          <p>Nutrition Grade: ${productDetail.nutrition_grade}</p>
        </div>
      </div>
      <table class="product-table">
        <thead>
          <tr>
            <th>Details</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Brands</td>
            <td>${productDetail.brands}</td>
          </tr>
          <tr>
            <td>Labels</td>
            <td>${productDetail.labels}</td>
          </tr>
          <tr>
            <td>Countries</td>
            <td>${productDetail.countries}</td>
          </tr>
          <tr>
            <td>Manufacturing Places</td>
            <td>${productDetail.manufacturing_places}</td>
          </tr>
          <tr>
            <td>Categories</td>
            <td>${productDetail.categories}</td>
          </tr>
        </tbody>
      </table>
      <div class="button-container">
        <button id="addToFavorites" class="button">Add to Favorites</button>
        <button id="addToList" class="button">Add to List</button>
        <a href="/store.html" class="button">Back to Store</a>
      </div>
    </div>
  </div>
  <script src="./scripts/product.js"></script>
</body>
</html>


  `;
}

function fetchProductDetail(productId: string): Promise<ProductDetail | null> {
  return new Promise((resolve, reject) => {
    const url = `https://world.openfoodfacts.org/api/v2/product/${productId}.json`;

    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const parsedData = JSON.parse(data);
        const product = parsedData.product;
        const productDetail: ProductDetail = {
          code: product.code,
          product_name: product.product_name,
          image_url: product.image_url,
          allergens: product.allergens,
          nutrition_grade: product.nutrition_grades,
          brands: product.brands,
          labels: product.labels,
          countries: product.countries,
          manufacturing_places: product.manufacturing_places,
          categories: product.categories,
          ingredients_text: product.ingredients_text,
          nutrient_levels: product.nutrient_levels,
          nutriments: product.nutriments,
          additives_n: product.additives_n,
          additives: product.additives,
        };
        resolve(productDetail);
      });

    }).on('error', (err) => {
      console.log('Error: ' + err.message);
      reject(err);
    });
  });
}


