import Vue from "vue";

const CareRecord = new Vue.resource("care-record{/key}");
const Config = new Vue.resource("config{/key}");
const Machine = new Vue.resource("machine{/id}");
const Model = new Vue.resource("model{/id}");
const User = new Vue.resource("user{/id}");

export { CareRecord, Config, Machine, Model, User };
