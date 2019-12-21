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
              <md-table-cell md-label="编号" md-sort-by="type">{{
                item.num
              }}</md-table-cell>
              <md-table-cell md-label="类型" md-sort-by="type">{{
                item.type
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
import { Machine } from "@/resources";

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
      searchQuery: {},
      searchDelayTimeout: null,
      queriedData: []
    };
  },
  activated() {
    this.queryData();
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
        buttonsStyling: false
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
          timer: 1500
        });
      }
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
