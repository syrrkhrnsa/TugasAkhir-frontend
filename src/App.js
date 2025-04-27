import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth.js";
import Landing from "./pages/landing.js";
import Dashboard from "./pages/dashboard.js";
import Sertifikat from "./pages/sertifikat.js";
import ProtectedRoute from "./utils/ProtectedRoute";
import CreateTanah from "./form/c_tanah.js";
import EditTanah from "./form/e_tanah.js";
import RiwayatTanah from "./log/log.js";
import PesanPerubahan from "./pages/approval.js";
import EditSertifikat from "./form/e_sertifikat.js";
import CreateSertifikat from "./form/c_sertifikat.js";
import DetailTanah from "./form/d_tanah.js";
import Log from "./log/log.js";
import Pemetaan from "./pages/pemetaan.js";
import Public from "./pages/Public.js";
import CreateFasilitas from "./form/c_fasilitas.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lihat-data-wakaf" element={<Public />} />

        {/* Grouping Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pemetaan" element={<Pemetaan />} />
          <Route path="/fasilitas/create" element={<CreateFasilitas />} />
          <Route path="/sertifikat" element={<Sertifikat />} />
          <Route path="/sertifikat/edit/:id" element={<EditSertifikat />} />
          <Route path="/sertifikat/create" element={<CreateSertifikat />} />
          {/* Route Tanah */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tanah/create" element={<CreateTanah />} />
          <Route path="/tanah/edit/:id" element={<EditTanah />} />
          <Route path="/tanah/detail/:idTanah" element={<DetailTanah />} />

          {/* <Route path="/tanah/peta/:id" element={<PetaTanah />} />
          <Route path="/tanah/history/:id" element={<HistoryTanah />} /> */}

          <Route path="/tanah/peta/:id" element={<Pemetaan />} />

          {/* Log Tanah*/}
          <Route path="/riwayat/tanah" element={<RiwayatTanah />} />
          <Route path="/log" element={<Log />} />
          {/* Pesan Perubahan*/}
          <Route path="/notifikasi" element={<PesanPerubahan />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
