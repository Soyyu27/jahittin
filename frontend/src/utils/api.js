import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Products
export const getProducts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/products`, { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/products/categories`);
  return response.data;
};

// Orders
export const createOrder = async (orderData) => {
  const response = await axios.post(`${API_URL}/orders`, orderData);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/orders/${id}`);
  return response.data;
};

// Designs
export const saveDesign = async (designData) => {
  const response = await axios.post(`${API_URL}/designs`, designData);
  return response.data;
};

export const getUserDesigns = async () => {
  const response = await axios.get(`${API_URL}/designs`);
  return response.data;
};

export const getDesignById = async (id) => {
  const response = await axios.get(`${API_URL}/designs/${id}`);
  return response.data;
};

export const deleteDesign = async (id) => {
  const response = await axios.delete(`${API_URL}/designs/${id}`);
  return response.data;
};

// Admin - Products
export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};

// Admin - Orders
export const updateOrderStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/orders/${id}/status`, { status });
  return response.data;
};