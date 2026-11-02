import "./styles/layout.css";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-body">
        <TopBar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}