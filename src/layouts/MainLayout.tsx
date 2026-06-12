import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];
const FOOTER_PATHS = ["/", "/posts", "/categories", "/tags"];

export default function MainLayout() {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const showFooter = FOOTER_PATHS.includes(pathname);

  return (
    <div className={`${isAuthPage ? "h-screen" : "min-h-screen"} flex flex-col bg-background`}>
      <Navbar />
      <main className={`flex-1 ${isAuthPage ? "overflow-hidden" : ""}`}>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
