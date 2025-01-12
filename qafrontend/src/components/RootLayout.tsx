import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/toaster";

export function RootLayout() {
  return (
    <>
      <Toaster />
      <main>
        <Outlet />
      </main>
    </>
  );
}
