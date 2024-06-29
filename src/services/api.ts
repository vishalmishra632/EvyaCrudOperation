import axios, { AxiosError } from 'axios';
import { GET_MEMBERS, ADD_MEMBER, UPDATE_MEMBER, DELETE_MEMBER } from '../services/endpoints';
import { Member, MemberInput } from '../types';

// src/services/api.ts
export const fetchMembers = async (
    page: number, 
    limit: number, 
    searchTerm: string, 
    sortColumn: string, 
    sortOrder: 'asc' | 'desc'
  ): Promise<{ items: Member[], total: number }> => {
    try {
      const response = await axios.get(GET_MEMBERS, {
        params: { page, limit, search: searchTerm, sortColumn, sortOrder }
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  };

  export const fetchMemberById = async (id: number): Promise<Member> => {
    try {
      const response = await axios.get<Member>(`${GET_MEMBERS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member by ID:', error);
      throw error;
    }
  };


  export const addMember = async (memberData: Omit<MemberInput, 'id'>): Promise<Member> => {
    console.log('addMember called with:', memberData);
    try {
        const response = await axios.post<Member>(ADD_MEMBER, memberData);
        console.log('addMember response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in addMember:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || error.message);
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
};


  export const updateMember = async (id: number, memberData: MemberInput): Promise<Member> => {
    try {
        const response = await axios.put<Member>(UPDATE_MEMBER(id), memberData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || error.message);
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
};

export const deleteMembers = async (ids: number[]): Promise<void> => {
    try {
        const response = await axios.post(DELETE_MEMBER, { ids });
        if (response.status !== 200) {
            throw new Error('Failed to delete members');
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message);
        } else {
            throw new Error(String(error));
        }
    }
};
