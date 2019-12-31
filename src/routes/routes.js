const DashboardLayout = () =>
  import("@/pages/Dashboard/Layout/DashboardLayout.vue");
const AuthLayout = () => import("@/pages/Dashboard/Pages/AuthLayout.vue");

// Dashboard pages
// import Dashboard from "@/pages/Dashboard/Dashboard.vue";

// Pages
const User = () => import("@/pages/Dashboard/User/UserProfile.vue");
const UserList = () => import("@/pages/Dashboard/User/UserList.vue");
const MachineList = () => import("@/pages/Dashboard/Machine/MachineList.vue");
const MachineDetail = () =>
  import("@/pages/Dashboard/Machine/MachineDetail.vue");
const ConfigList = () => import("@/pages/Dashboard/Config/ConfigList.vue");
const Config = () => import("@/pages/Dashboard/Config/Config.vue");
const Login = () => import("@/pages/Dashboard/Pages/Login.vue");
const Register = () => import("@/pages/Dashboard/Pages/Register.vue");
const Lock = () => import("@/pages/Dashboard/Pages/Lock.vue");

let machineMenu = {
  path: "/machine",
  component: DashboardLayout,
  redirect: "/machine/index",
  children: [
    {
      path: "index",
      name: "机械列表",
      component: MachineList,
      meta: {
        keepAlive: true
      }
    },
    {
      path: ":id",
      name: "机械详情",
      component: MachineDetail
    }
  ]
};

let configMenu = {
  path: "/config",
  component: DashboardLayout,
  redirect: "/config/index",
  children: [
    {
      path: "index",
      name: "配置列表",
      component: ConfigList,
      meta: {
        keepAlive: true
      }
    },
    {
      path: ":key",
      name: "配置详情",
      component: Config
    }
  ]
};

let userMenu = {
  path: "/user",
  component: DashboardLayout,
  redirect: "/user/index",
  children: [
    {
      path: "index",
      name: "用户列表",
      component: UserList,
      meta: {
        keepAlive: true
      }
    },
    {
      path: ":id",
      name: "用户详情",
      component: User
    }
  ]
};

let authPages = {
  path: "/",
  component: AuthLayout,
  name: "Authentication",
  children: [
    {
      path: "/login",
      name: "用户登录",
      component: Login
    },
    {
      path: "/register",
      name: "用户注册",
      component: Register
    },
    {
      path: "/lock",
      name: "锁定",
      component: Lock
    }
  ]
};

const routes = [
  {
    path: "/",
    redirect: "/machine",
    name: "Home"
  },
  machineMenu,
  configMenu,
  userMenu,
  authPages,
  {
    path: "/",
    component: DashboardLayout
  }
];

export default routes;
