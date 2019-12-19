import Vue from "vue";

const Config = new Vue.resource("config{/key}");
const Machine = new Vue.resource("machine{/id}");
const User = new Vue.resource("user{/id}");

export { Config, Machine, User };
