import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-black text-center text-gray-300 font-mono flex flex-col items-center justify-center">
      <div class="min-h-screen flex flex-grow items-center justify-center bg-gray-50">
        <div class="rounded-lg bg-white p-8 text-center shadow-xl">
          <h1 class="mb-4 text-4xl font-bold">404</h1>
          <p class="text-gray-600">
            Oops! The page you are looking for could not be found.
          </p>
          <p
            onClick={() => navigate('/')}
            class="mt-4 inline-block rounded bg-[#7E5FF9] px-4 py-2 font-semibold text-white hover:bg-[#856af0] cursor-pointer"
          >
            {" "}
            Go back to Home{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
