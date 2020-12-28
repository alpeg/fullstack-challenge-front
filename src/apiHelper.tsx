import { ProductPizza, CartItem, CartHash, cartArrToHash, cartAdd, User, SpaConfig } from './util';
import axios from './axiosConfig';
export interface AppOptions {
  user: User | null,
  productList: ProductPizza[],
  spaConfig: SpaConfig,
}
export async function apiInitialize(): Promise<AppOptions> {
  var user: User | null = null;
  try {
    const whoami = (await axios.post('/auth/whoami')).data;
    user = whoami.success ? whoami.user : null;
  } catch (e) { }
  if (!user) {
    try {
      await axios.get('/sanctum/csrf-cookie');
    } catch (e) {
      throw new Error('Unfortunately, an error occurred while trying to communicate with backend service. Please try again later. ' + (e?.message || e));
    }
  }
  const productListPromise = axios.get('/pizza/all');
  const spaConfigPromise = axios.get('/order/spa-config');
  var productList, spaConfig;
  try {
    productList = (await productListPromise).data as ProductPizza[];
    spaConfig = (await spaConfigPromise).data as SpaConfig;
  } catch (e) {
    throw new Error('Unfortunately, an error occurred while trying to communicate with backend service to get product list. Please try again later. ' + (e?.message || e));
  }
  return { user, productList, spaConfig };
}