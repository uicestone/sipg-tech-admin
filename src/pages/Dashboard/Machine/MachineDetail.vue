<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-medium-size-100 md-size-66 md-layout">
        <div class="md-layout-item md-medium-size-100 md-size-100 mx-auto">
          <form @submit.prevent="save">
            <md-card>
              <md-card-header
                class="md-card-header-icon md-card-header-primary"
              >
                <div class="card-icon">
                  <md-icon>local_shipping</md-icon>
                </div>
                <h4 class="title">{{ machine.num }}</h4>
              </md-card-header>

              <md-card-content class="md-layout">
                <div class="md-layout-item md-layout md-alignment-vertical">
                  <div class="md-layout-item md-small-size-100 md-size-50">
                    <md-field>
                      <label>编号</label>
                      <md-input
                        v-model="machine.num"
                        type="number"
                        min="1000"
                        max="9999"
                        required
                      ></md-input>
                    </md-field>
                  </div>
                  <div class="md-layout-item md-small-size-100 md-size-50">
                    <md-field>
                      <label>型号</label>
                      <md-select
                        v-model="machine.model"
                        @keydown.enter.prevent=""
                      >
                        <md-option
                          v-for="model in models"
                          :key="model.name"
                          :value="model.name"
                          >{{ model.name }}</md-option
                        >
                      </md-select>
                    </md-field>
                  </div>
                  <div class="md-layout-item md-small-size-100 md-size-50">
                    <md-datepicker
                      v-model="machine.firstDay"
                      :md-model-type="String"
                      md-immediately
                      ><label>启用日期</label></md-datepicker
                    >
                  </div>
                  <div class="md-layout-item md-small-size-100 md-size-50">
                    <md-field>
                      <label>总运行时间</label>
                      <md-input
                        v-model="machine.totalHours"
                        type="number"
                        required
                      ></md-input>
                      <span class="md-suffix">小时</span>
                    </md-field>
                  </div>
                  <div class="md-layout-item md-small-size-100 md-size-50">
                    <md-field>
                      <label>厂牌</label>
                      <md-input v-model="machine.brand" type="text"></md-input>
                    </md-field>
                  </div>
                  <div class="md-layout-item md-small-size-100 md-size-50">
                    <md-field>
                      <label>描述</label>
                      <md-input v-model="machine.desc"></md-input>
                    </md-field>
                  </div>
                </div>
                <div class="md-layout-item md-size-100 text-right">
                  <md-button type="submit" class="md-raised md-primary mt-4"
                    >保存</md-button
                  >
                </div>
              </md-card-content>
            </md-card>
          </form>
        </div>
        <div class="md-layout-item md-medium-size-100 md-size-100 mx-auto">
          <md-card>
            <md-card-header class="md-card-header-icon md-card-header-green">
              <div class="card-icon">
                <md-icon>new_releases</md-icon>
              </div>
              <h4 class="title">保养项目</h4>
            </md-card-header>

            <md-card-content class="md-layout">
              <md-table class="table-full-width">
                <md-table-row
                  v-for="item in sorted"
                  :key="item.name"
                  @click="openCareForm(item)"
                  style="cursor:pointer"
                  :class="{
                    'table-warning':
                      !item.cycleAlertLeft ||
                      (item.cycleLeft > 0 && item.cycleAlertLeft <= 0),
                    'table-danger': item.cycleLeft <= 0
                  }"
                >
                  <md-table-cell md-label="类目">{{
                    item.category
                  }}</md-table-cell>
                  <md-table-cell md-label="项目" style="width:30%">{{
                    item.name
                  }}</md-table-cell>
                  <md-table-cell md-label="周期">{{
                    item | careItemCycle
                  }}</md-table-cell>
                  <md-table-cell md-label="上次">{{
                    item.last || "-"
                  }}</md-table-cell>
                  <md-table-cell md-label="剩余">{{
                    item | careItemLeft
                  }}</md-table-cell>
                </md-table-row>
              </md-table>
            </md-card-content>
          </md-card>
        </div>
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33 mx-auto">
        <md-card v-sticky="{ stickyTop: 25 }">
          <md-card-header class="md-card-header-icon md-card-header-green">
            <div class="card-icon">
              <md-icon>timer</md-icon>
            </div>
            <h4 class="title">保养记录</h4>
          </md-card-header>

          <md-card-content class="md-layout">
            <md-table class="table-full-width">
              <md-table-row v-for="record in careRecords" :key="record.id">
                <md-table-cell md-label="项目"
                  ><b>{{ record.careItem.category }}</b
                  ><br />{{ record.careItem.name }}</md-table-cell
                >
                <md-table-cell md-label="日期" style="min-width:90px"
                  >{{ record.date }}<br />{{
                    record.operator.name
                  }}</md-table-cell
                >
              </md-table-row>
            </md-table>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import moment from "moment";
import VueSticky from "vue-sticky";
import { CareRecord, Machine, Model } from "@/resources";

export default {
  directives: {
    sticky: VueSticky
  },
  data() {
    return {
      models: [],
      machine: {
        careItems: []
      },
      careRecords: []
    };
  },
  computed: {
    sorted() {
      return this.machine.careItems.sort((a, b) => b.alertLevel - a.alertLevel);
    }
  },
  methods: {
    async save() {
      if (this.$route.params.id === "add") {
        this.machine = (await Machine.save(this.machine)).body;
      } else {
        this.machine = (
          await Machine.update({ id: this.$route.params.id }, this.machine)
        ).body;
      }
      this.$notify({
        message: "保存成功",
        icon: "check",
        horizontalAlign: "center",
        verticalAlign: "bottom",
        type: "success"
      });
      if (this.$route.params.id === "add") {
        this.$router.replace(`/machine/${this.machine.id}`);
      }
    },
    async openCareForm(item) {
      const result = await Swal.fire({
        title: `${this.machine.num}更新保养状态`,
        html:
          item.cycleType === "runHour"
            ? `<p>保养项目：${item.name}</p><p>请输入保养时运行时长：</p>`
            : `<p>保养项目：${item.name}</p><p>请输入保养时日期：</p>`,
        input: item.cycleType === "runHour" ? "number" : "text",
        inputPlaceholder:
          item.cycleType === "runHour"
            ? this.machine.totalHours
            : moment().format("YYYY-MM-DD"),
        inputValue:
          item.cycleType === "runHour"
            ? this.machine.totalHours
            : moment().format("YYYY-MM-DD"),
        inputValidator:
          item.cycleType === "runHour"
            ? v => {
                if (!v) {
                  return "请输入有效的运行时长";
                }
                if (v > this.machine.totalHours) {
                  return "保养运行时长不能大于最新运行时长";
                }
              }
            : v => {
                if (!v || !v.match(/\d{4}-\d{2}-\d{2}/)) {
                  return "请输入有效的日期";
                }
              },
        showCancelButton: true,
        confirmButtonText: "更新",
        confirmButtonClass: "md-button md-success",
        cancelButtonText: "取消",
        cancelButtonClass: "md-button",
        buttonsStyling: false,
        width: "26rem"
      });

      if (result.value) {
        this.machine.careItems.find(i => {
          if (i.name === item.name) {
            i.last = result.value;
            return true;
          }
        });
        this.machine = (
          await Machine.update(
            { id: this.machine.id },
            { careItems: this.machine.careItems }
          )
        ).body;
        this.getCareRecords();
        Swal.fire({
          title: "更新完成",
          type: "success",
          confirmButtonText: "好",
          confirmButtonClass: "md-button md-success",
          buttonsStyling: false,
          timer: 1500,
          width: "26rem"
        });
      }
    },
    async getCareRecords() {
      this.careRecords = (
        await CareRecord.get({ machine: this.machine.id })
      ).body;
    }
  },
  async mounted() {
    this.models = (await Model.get({ limit: false })).body;
    if (this.$route.params.id !== "add") {
      this.machine = (await Machine.get({ id: this.$route.params.id })).body;
      this.getCareRecords();
    }
  }
};
</script>
<style lang="scss">
.md-table.table-full-width {
  width: calc(100% + 40px);
}
</style>
