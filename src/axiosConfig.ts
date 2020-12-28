import axios from 'axios';
const instance = axios.create({});
instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
instance.defaults.headers.common['Accept'] = 'application/json';
instance.defaults.withCredentials = true;
export default instance;
