import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PetaTanah from "../pages/PemetaanTanah";

const PetaTanahPage = () => {
  const { id } = useParams();

  return (
    <Sidebar>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Pemetaan Tanah</h2>
          <PetaTanah tanahId={id} />
        </div>
      </div>
    </Sidebar>
  );
};

export default PetaTanahPage;
