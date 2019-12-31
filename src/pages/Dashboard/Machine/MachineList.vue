<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-primary">
          <div class="card-icon">
            <md-icon>local_shipping</md-icon>
          </div>
          <h4 class="title">机械列表</h4>
        </md-card-header>
        <md-card-content>
          <md-table
            :value="queriedData"
            :md-sort.sync="currentSort"
            :md-sort-order.sync="currentSortOrder"
            :md-sort-fn="noop"
            class="paginated-table table-striped table-hover table-action"
          >
            <md-table-toolbar class="md-layout mb-2">
              <div class="md-layout-item md-layout">
                <md-field
                  class="md-layout md-layout-item md-size-20 md-xsmall-size-100"
                >
                  <md-input
                    type="search"
                    clearable
                    placeholder="搜索编号"
                    v-model="searchQuery.num"
                  >
                  </md-input>
                </md-field>

                <md-field
                  class="md-layout md-layout-item md-size-20 md-xsmall-size-100"
                >
                  <md-select v-model="searchQuery.model" placeholder="车型">
                    <md-option
                      v-for="model in models"
                      :key="model.id"
                      :value="model.name"
                      >{{ model.name }}</md-option
                    >
                  </md-select>
                </md-field>

                <md-field
                  class="md-layout md-layout-item md-size-20 md-xsmall-size-100"
                >
                  <md-autocomplete
                    autocomplete="off"
                    v-model="searchQuery.careItem"
                    :md-options="careItemSlugs"
                    @md-opened="getModels"
                  >
                    <label>保养项目</label>
                    <template
                      slot="md-autocomplete-item"
                      slot-scope="{ item, term }"
                    >
                      <md-highlight-text :md-term="term">{{
                        item
                      }}</md-highlight-text>
                    </template>
                  </md-autocomplete>
                </md-field>

                <md-field
                  class="md-layout md-layout-item md-size-20 md-xsmall-size-100"
                >
                  <md-select
                    v-model="searchQuery.alertType"
                    placeholder="提示类型"
                  >
                    <md-option value="">所有</md-option>
                    <md-option value="alert">警告</md-option>
                    <md-option value="expired">超期</md-option>
                  </md-select>
                </md-field>
              </div>
              <div class="toolbar-actions">
                <md-button class="md-primary" @click="showCreate">
                  添加机械
                </md-button>
              </div>
            </md-table-toolbar>

            <md-table-row
              slot="md-table-row"
              md-selectable="single"
              slot-scope="{ item }"
              @click="showDetail(item)"
            >
              <md-table-cell md-label="编号" md-sort-by="num">{{
                item.num
              }}</md-table-cell>
              <md-table-cell md-label="型号" md-sort-by="model">{{
                item.model
              }}</md-table-cell>
              <md-table-cell
                md-label="运行时长"
                md-sort-by="totalHours"
                @click.native.stop="openUpdateHoursForm(item)"
                >{{ item.totalHours }}</md-table-cell
              >
              <md-table-cell
                md-label="保养需求"
                md-sort-by="careItems.cycleLeft"
                style="width:50%"
              >
                <div
                  v-for="item in item.careItems.filter(
                    i => i.cycle && i.cycleAlertLeft <= 0 && i.cycleLeft > 0
                  )"
                  :key="item.name"
                  class="text-warning"
                >
                  <b>{{ item.category }}：</b>
                  <span>{{ item.name }}</span>
                </div>
                <div
                  v-for="item in item.careItems.filter(
                    i => i.cycle && i.cycleLeft <= 0
                  )"
                  :key="item.name"
                  class="text-danger"
                >
                  <b>{{ item.category }}：</b>
                  <span>{{ item.name }}</span>
                </div>
              </md-table-cell>
              <md-table-cell md-label="操作" style="width:100px">
                <md-button
                  class="md-just-icon md-primary md-simple"
                  @click.stop="openUpdateHoursForm(item)"
                >
                  <md-icon>timer</md-icon>
                </md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>
        <md-card-actions md-alignment="space-between">
          <div class="">
            <p class="card-category">{{ from }} - {{ to }} / {{ total }}</p>
          </div>
          <pagination
            class="pagination-no-border pagination-primary"
            v-model="pagination.currentPage"
            :per-page="pagination.perPage"
            :total="total"
          >
          </pagination>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { Pagination } from "@/components";
import { Machine, Model } from "@/resources";

export default {
  components: {
    Pagination
  },
  data() {
    return {
      currentSort: "_id",
      currentSortOrder: "desc",
      pagination: {
        perPage: 10,
        currentPage: 1,
        total: 0
      },
      searchQuery: { careItem: "" },
      searchDelayTimeout: null,
      queriedData: [],
      models: [],
      careItemSlugs: []
    };
  },
  activated() {
    this.queryData();
    this.getModels();
  },
  computed: {
    query() {
      return Object.assign({}, this.searchQuery, {
        limit: this.pagination.perPage,
        skip: (this.pagination.currentPage - 1) * this.pagination.perPage,
        order: this.currentSort
          ? `${this.currentSortOrder === "desc" ? "-" : ""}${this.currentSort}`
          : undefined
      });
    },
    from() {
      return Math.min(
        this.pagination.perPage * (this.pagination.currentPage - 1) + 1,
        this.total
      );
    },
    to() {
      return Math.min(this.from + this.pagination.perPage - 1, this.total);
    },
    total() {
      return this.pagination.total;
    }
  },
  methods: {
    async queryData() {
      const response = await Machine.get(this.query);
      this.queriedData = response.body;
      this.pagination.total = Number(response.headers.map["items-total"][0]);
    },
    showDetail(item) {
      this.$router.push(`/machine/${item.id}`);
    },
    showCreate() {
      this.$router.push("/machine/add");
    },
    noop() {},
    async openUpdateHoursForm(machine) {
      const result = await Swal.fire({
        title: `${machine.num}当前的总运行时长`,
        input: "number",
        inputPlaceholder: machine.totalHours,
        inputValidator: v => {
          if (!v) {
            return "请输入有效的运行时长";
          }
          if (v < machine.totalHours) {
            return "运行时长不能小于原运行时长";
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
        machine.totalHours = result.value;
        await Machine.update(
          { id: machine.id },
          { totalHours: machine.totalHours }
        );
        Swal.fire({
          title: "更新完成",
          type: "success",
          confirmButtonText: "好",
          confirmButtonClass: "md-button md-success",
          buttonsStyling: false,
          timer: 1500,
          width: "26rem"
        });
        this.queryData();
      }
    },
    async getModels() {
      this.models = (await Model.get()).body;
      const careItemSlugsSet = new Set();
      this.models.forEach(model => {
        model.careItems.forEach(item => {
          careItemSlugsSet.add(item.category + "-" + item.name);
        });
      });
      this.careItemSlugs = Array.from(careItemSlugsSet.values());
    }
  },
  watch: {
    "pagination.currentPage"() {
      this.queryData();
    },
    searchQuery: {
      handler() {
        clearTimeout(this.searchDelayTimeout);
        this.searchDelayTimeout = setTimeout(() => {
          this.queryData();
        }, 200);
      },
      deep: true
    },
    currentSort() {
      this.queryData();
    },
    currentSortOrder() {
      this.queryData();
    }
  },
  filters: {
    alertItems(items) {
      return items.filter(item => item.cycleAlertLeft < 0);
    },
    expiredItems(items) {
      return items.filter(item => item.cycleLeft < 0);
    }
  }
};
</script>

<style lang="css" scoped>
.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}
</style>
