<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-medium-size-100 md-size-66 mx-auto">
        <form @submit.prevent="save">
          <md-card>
            <md-card-header class="md-card-header-icon md-card-header-primary">
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
                    ></md-input>
                  </md-field>
                </div>
                <div class="md-layout-item md-small-size-100 md-size-50">
                  <md-field>
                    <label>描述</label>
                    <md-input v-model="machine.desc"></md-input>
                  </md-field>
                </div>
                <div class="md-layout-item md-small-size-100 md-size-50">
                  <md-field>
                    <label>种类</label>
                    <md-select v-model="machine.type" @keydown.enter.prevent="">
                      <md-option
                        v-for="type in ['平板', '叉车', '吊车', '门机', '皮卡']"
                        :key="type"
                        :value="type"
                        >{{ type }}</md-option
                      >
                    </md-select>
                  </md-field>
                </div>
                <div class="md-layout-item md-small-size-100 md-size-50">
                  <md-field>
                    <label>总运行时间</label>
                    <md-input
                      v-model="machine.totalHours"
                      type="number"
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
                    <label>型号</label>
                    <md-input v-model="machine.model" type="text"></md-input>
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
    </div>
  </div>
</template>

<script>
import { Machine } from "@/resources";

export default {
  data() {
    return {
      machine: {
        name: "",
        roles: []
      }
    };
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
    }
  },
  async mounted() {
    if (this.$route.params.id !== "add") {
      this.machine = (await Machine.get({ id: this.$route.params.id })).body;
    }
  }
};
</script>
<style lang="scss">
</style>
