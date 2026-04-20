import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{
        marginLeft: "var(--sidebar-w)",
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--cream)",
      }}>
        <TopBar />
        <main style={{ flex: 1, padding: "28px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
