import Vue from "vue";

const Config = new Vue.resource("config{/key}");
const Machine = new Vue.resource("machine{/id}");
const Model = new Vue.resource("model{/id}");
const User = new Vue.resource("user{/id}");

export { Config, Machine, Model, User };
