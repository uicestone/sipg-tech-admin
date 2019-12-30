import Vue from "vue";
import VueRouter from "vue-router";
import VueResource from "vue-resource";
import moment from "moment";
import DashboardPlugin from "./material-dashboard";

// Plugins
import App from "./App.vue";
import Chartist from "chartist";

// router setup
import routes from "./routes/routes";

// plugin setup
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(DashboardPlugin);

moment.locale("zh-cn");

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  scrollBehavior: to => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
  linkExactActiveClass: "nav-item active"
});

// global library setup
Object.defineProperty(Vue.prototype, "$Chartist", {
  get() {
    return this.$root.Chartist;
  }
});

Object.defineProperty(Vue.prototype, "$isLoading", {
  get() {
    return this.$root.isLoading;
  },
  set(val) {
    this.$root.isLoading = val;
  }
});

const config = {}; // global config from api

Object.defineProperty(Vue.prototype, "$config", {
  get() {
    return config;
  },
  set(val) {
    Object.assign(config, val);
  }
});

Object.defineProperty(Vue.prototype, "$user", {
  get() {
    this.$root.user.can = function(cap) {
      const roleCaps = {
        admin: ".*"
      };
      return this.role && cap.match(`^${roleCaps[this.role]}$`);
    };

    return this.$root.user;
  },
  set(val) {
    this.$root.user = val;
  }
});

Vue.filter("date", (value, format) => {
  if (!value) {
    return null;
  }
  return moment(value).format(format || "YYYY-MM-DD HH:mm");
});

Vue.filter("duration", value => {
  return moment.duration(value).humanize();
});

Vue.filter("round", (value, digits) => {
  if (!value) {
    return (0).toFixed(digits);
  }
  return value.toFixed(digits || 0);
});

Vue.filter("currency", value => {
  if (value === undefined || value === null) return "-";
  return "¥ " + (+value).toFixed(2);
});

Vue.filter("careItemCycle", item => {
  const map = {
    month: "个月",
    runHour: "运行小时",
    onDemand: "按需"
  };

  const { cycle, cycleType } = item;

  const cycleUnitLabel = map[cycleType];

  if (cycle) {
    return "每" + cycle + cycleUnitLabel;
  } else {
    return cycleUnitLabel;
  }
});

Vue.filter("careItemLeft", (item, alert = false) => {
  const { cycleType, cycleLeft, cycleAlertLeft } = item;
  const left = alert ? cycleAlertLeft : cycleLeft;
  switch (cycleType) {
    case "month":
      return (left > 0 ? "+" : "") + Math.round(left * 30.42) + "天";
    case "runHour":
      return (left > 0 ? "+" : "") + left + "小时";
    case "onDemand":
      return "按需";
  }
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: h => h(App),
  router,
  data: {
    Chartist: Chartist,
    user: {},
    isLoading: false
  }
});
