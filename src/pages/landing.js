import React from "react";
import { Link } from "react-router-dom";
import NavbarLanding from "../components/NavbarLanding";
import landingphoto from "../assets/landing.png";

const Landing = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar dengan Logo */}
      <div className="flex items-center justify-between px-10 py-4">
        <NavbarLanding />
      </div>

      {/* Main Content */}
      <div className="flex flex-grow ml-40"> {/* Menambahkan margin kiri lebih besar */}
        {/* Left Section */}
        <div className="flex flex-col justify-center items-start pl-20 w-1/2"> {/* Menambahkan padding kiri lebih besar */}
          <h1 className="text-4xl font-bold">
            <span className="text-hijau">Pemetaan </span>
            <span className="text-kuning">Tanah </span>
          </h1>
          <h2 className="text-3xl font-bold mt-2">
            <span className="text-kuning">Wakaf </span>
            <span className="text-hijau">yang terintegrasi</span>
          </h2>
          <p className="text-lg text-gray-500 mt-4 max-w-md">
            Dari pemetaan hingga pengelolaan, kami hadir untuk memastikan setiap
            jengkal tanah wakaf menjadi sumber keberkahan yang berkelanjutan.
          </p>
          <Link
            to="/lihat-data-wakaf"
            className="bg-[#96B9C7] hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-md mt-6 flex items-center justify-center"
          >
            Lihat Data Wakaf
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex justify-center items-center w-1/2 bg-cover bg-center relative">
          <img
            src={landingphoto}
            alt="Landing Illustration"
            className="w-3/4 h-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
