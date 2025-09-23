import axios from 'axios';
import { Item, ItemRequest, ApiResponse } from '../types/item';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const itemService = {
  async createItem(item: ItemRequest): Promise<Item> {
    const response = await api.post<ApiResponse<Item>>('/items', item);
    return response.data.body;
  },

  async getItems(): Promise<Item[]> {
    const response = await api.get<ApiResponse<Item[]>>('/items');
    return response.data.body;
  },

  async getItem(id: string): Promise<Item> {
    const response = await api.get<ApiResponse<Item>>(`/items/${id}`);
    return response.data.body;
  },

  async updateItem(id: string, updates: ItemRequest): Promise<Item> {
    const response = await api.put<ApiResponse<Item>>(`/items/${id}`, updates);
    return response.data.body;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/items/${id}`);
  },
};