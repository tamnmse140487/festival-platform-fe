import React from 'react';
import DashboardPage from "../pages/dashboard/DashboardPage";
import FestivalListPage from "../pages/festivals/FestivalListPage";
import CreateFestivalPage from "../pages/festivals/CreateFestivalPage";
import EditFestivalPage from "../pages/festivals/EditFestivalPage";
import FestivalDetailPage from "../pages/festivals/FestivalDetailPage";
import SupplierListPage from "../pages/suppliers/SupplierListPage";
import StudentGroupPage from "../pages/groups/StudentGroupPage";
import BoothListPage from "../pages/booths/BoothListPage";
import CreateBoothPage from "../pages/booths/CreateBoothPage";
import GameListPage from "../pages/games/GameListPage";
import CreateGamePage from "../pages/games/CreateGamePage";
import PointsPage from "../pages/points/PointsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SchoolListPage from "../pages/schools/SchoolListPage";
import SystemSettingsPage from "../pages/system/SystemSettingsPage";
import IngredientPage from "../pages/ingredient/IngredientPage";
import { ROLE_NAME } from '../utils/constants';
import AccountManagementPage from '../pages/accounts/AccountManagementPage';
import SupplyManagementPage from '../pages/suppliers/SupplyManagementPage';
import AdminFestivalDetail from '../pages/festivals/admin/AdminFestivalDetail';

export const protectedRoutes = [
  // Dashboard
  {
    path: "/app/dashboard",
    element: <DashboardPage />,
    roles: []
  },

  // Festivals
  {
    path: "/app/festivals",
    element: <FestivalListPage />,
    roles: []
  },
  {
    path: "/app/festivals/create",
    element: <CreateFestivalPage />,
    roles: [ROLE_NAME.SCHOOL_MANAGER]
  },
  {
    path: "/app/festivals/:id/edit",
    element: <EditFestivalPage />,
    roles: [ROLE_NAME.SCHOOL_MANAGER]
  },
  {
    path: "/app/festivals/:id",
    element: <FestivalDetailPage />,
    roles: []
  },
  {
    path: "/app/festivals/admin/:id",
    element: <AdminFestivalDetail />,
    roles: [ROLE_NAME.ADMIN]
  },

  // Supplier
  {
    path: "/app/suppliers",
    element: <SupplierListPage />,
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER, ROLE_NAME.SUPPLIER]
  },
  {
    path: "/app/supplies",
    element: <SupplyManagementPage />,
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPPLIER, ROLE_NAME.SCHOOL_MANAGER]
  },

  // Groups and internal groups
  {
    path: "/app/groups",
    element: <StudentGroupPage />,
    roles: [ROLE_NAME.SCHOOL_MANAGER, ROLE_NAME.TEACHER, ROLE_NAME.STUDENT]
  },

  // Booths
  {
    path: "/app/booths",
    element: <BoothListPage />,
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER]
  },
  {
    path: "/app/booths/create/:festivalId",
    element: <CreateBoothPage />,
    roles: [ROLE_NAME.STUDENT]
  },

  // Games
  {
    path: "/app/games",
    element: <GameListPage />,
    roles: [ROLE_NAME.TEACHER, ROLE_NAME.STUDENT, ROLE_NAME.USER]
  },
  {
    path: "/app/games/create/:boothId",
    element: <CreateGamePage />,
    roles: [ROLE_NAME.STUDENT]
  },

  // Points
  {
    path: "/app/points",
    element: <PointsPage />,
    roles: [ROLE_NAME.STUDENT, ROLE_NAME.USER]
  },

  // Schools
  {
    path: "/app/schools",
    element: <SchoolListPage />,
    roles: [ROLE_NAME.ADMIN]
  },

  // System
  {
    path: "/app/system",
    element: <SystemSettingsPage />,
    roles: [ROLE_NAME.ADMIN]
  },

  // Profile
  {
    path: "/app/profile",
    element: <ProfilePage />,
    roles: []
  },

  // Ingredient
  {
    path: "/app/ingredients",
    element: <IngredientPage />,
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPPLIER]
  },

  //Accounts
  {
    path: "/app/accounts",
    element: <AccountManagementPage />,
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER]
  },

];