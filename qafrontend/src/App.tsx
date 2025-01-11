import React, { ReactNode, useState } from "react";
//import { ProfileForm } from "./formComponent";
import { Button } from "./components/ui/button";
import { ProfileForm } from "./ProfileForm";
import { Toaster } from "./components/ui/toaster";
import { LoginForm } from "./LoginForm";
function App() {
  return (
    <>
      <Toaster />
      <div className="flex flex-row justify-around">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="mb-4 text-xl font-bold">Creeaza Cont</div>
          <ProfileForm></ProfileForm>
        </div>

        <div className="flex flex-col justify-center items-center h-screen">
          <div className="mb-4 text-xl font-bold">Login</div>
          <LoginForm></LoginForm>
        </div>
      </div>
    </>
  );
}

export default App;
