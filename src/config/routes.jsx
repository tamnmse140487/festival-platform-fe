import React from 'react';
import DashboardPage from "../pages/dashboard/DashboardPage";
import FestivalListPage from "../pages/festivals/FestivalListPage";
// import CreateFestivalPage from "../pages/festivals/CreateFestivalPage";
// import FestivalDetailPage from "../pages/festivals/FestivalDetailPage";
// import SupplierListPage from "../pages/suppliers/SupplierListPage";
// import StudentGroupPage from "../pages/groups/StudentGroupPage";
// import BoothListPage from "../pages/booths/BoothListPage";
// import CreateBoothPage from "../pages/booths/CreateBoothPage";
// import GameListPage from "../pages/games/GameListPage";
// import CreateGamePage from "../pages/games/CreateGamePage";
// import PointsPage from "../pages/points/PointsPage";
// import ProfilePage from "../pages/profile/ProfilePage";
// import SchoolListPage from "../pages/schools/SchoolListPage";
// import SystemSettingsPage from "../pages/system/SystemSettingsPage";

export const protectedRoutes = [
  // Dashboard
  {
    path: "dashboard",
    element: <DashboardPage />,
    roles: []
  },

  // Festivals
  {
    path: "festivals",
    element: <FestivalListPage />,
    roles: []
  },
  {
    path: "festivals/create",
    // element: <CreateFestivalPage />,
    roles: ["school_manager"]
  },
  {
    path: "festivals/:id",
    // element: <FestivalDetailPage />,
    roles: []
  },

  // Suppliers
  {
    path: "suppliers",
    // element: <SupplierListPage />,
    roles: ["admin", "school_manager", "supplier"]
  },

  // Groups
  {
    path: "groups",
    // element: <StudentGroupPage />,
    roles: ["school_manager", "teacher"]
  },

  // Booths
  {
    path: "booths",
    // element: <BoothListPage />,
    roles: ["admin", "school_manager", "teacher", "student"]
  },
  {
    path: "booths/create/:festivalId",
    // element: <CreateBoothPage />,
    roles: ["student"]
  },

  // Games
  {
    path: "games",
    // element: <GameListPage />,
    roles: ["student", "teacher"]
  },
  {
    path: "games/create/:boothId",
    // element: <CreateGamePage />,
    roles: ["student"]
  },

  // Points
  {
    path: "points",
    // element: <PointsPage />,
    roles: ["student", "guest"]
  },

  // Schools
  {
    path: "schools",
    // element: <SchoolListPage />,
    roles: ["admin"]
  },

  // System
  {
    path: "system",
    // element: <SystemSettingsPage />,
    roles: ["admin"]
  },

  // Profile
  {
    path: "profile",
    // element: <ProfilePage />,
    roles: []
  }
];