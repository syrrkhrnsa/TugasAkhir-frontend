import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Variabel global untuk menyimpan user_id dan role_id
let userId = null;
let roleId = null;

// Fungsi untuk set data
export const setAuthData = (user, role) => {
  userId = user;
  roleId = role;
};

// Fungsi untuk get data
export const getUserId = () => userId;
export const getRoleId = () => roleId;
