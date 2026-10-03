import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  const hideLayout = ["/admin", "/counsellor","/student","/mentor/"].some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main
        className={
          hideLayout
            ? "flex-grow w-full mx-auto"
            : "flex-grow overflow-x-hidden w-full"
        }
      >
        {children}
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

export default Layout;
