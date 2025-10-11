import { useState } from "react";
import { usersApi } from "../api/users";

export const useUsers = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const searchUsers = async (query: string, limit = 20) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = (await usersApi.search(query, limit)) as any;
      setSearchResults(response.users || []);
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getUserDetails = async (userId: number) => {
    setIsLoadingDetails(true);
    try {
      const response = (await usersApi.getById(userId)) as any;
      setUserDetails(response.user);
      return response.user;
    } catch (error) {
      console.error("Failed to get user details:", error);
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    userDetails,
    isLoadingDetails,
    searchUsers,
    getUserDetails,
    clearSearch,
  };
};
