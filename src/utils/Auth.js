import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Variabel global untuk menyimpan user_id dan role_id
let userId = null;
let roleId = null;
let userName = null;

// Fungsi untuk set data
export const setAuthData = (user, role, username) => {
  userId = user;
  roleId = role;
  userName = username;
};

// Fungsi untuk get data
export const getUserId = () => userId || localStorage.getItem("user_id");
export const getRoleId = () => roleId || localStorage.getItem("role_id");
export const getUserName = () => userName || localStorage.getItem("user_name");

// Fungsi untuk clear data saat logout
export const clearAuthData = () => {
  userId = null;
  roleId = null;
  userName = null;
  localStorage.removeItem("user_id");
  localStorage.removeItem("role_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("token");
};
