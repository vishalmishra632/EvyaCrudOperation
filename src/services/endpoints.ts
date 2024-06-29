import API_URL from './config';
export const GET_MEMBERS = `${API_URL}/members`;
export const ADD_MEMBER = `${API_URL}/members`;
export const UPDATE_MEMBER = (id: number) => `${API_URL}/members/${id}`;
export const DELETE_MEMBER = `${API_URL}/members/delete`;