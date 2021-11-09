<template>
  <div
    class="previewBox"
    :class="{ hide: hide, disabledEvents: disabledEvents }"
  >
    <iframe class="iframe" ref="iframeRef" :srcdoc="srcdoc"></iframe>
  </div>
</template>

<script>
export default {
  name: "CodeJsRuner",
  props: {
    hide: {
      type: Boolean,
      default: true,
    },
    head: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      disabledEvents: true,
      logList: [],
    };
  },
  computed: {
    srcdoc() {
      const head = `
      <title>预览<\/title>
    ${this.head}
    <script src="/public/console/index.js"><\/script>
`;
      let body = `
    <script>
        try {
          ${this.content}
        } catch (err) {
          console.error('js代码运行出错')
          console.error(err)
        }
    <\/script>
  `;
      let str = this.assembleHtml(head, body);
      return str;
    },
  },
  watch: {
    logList: {
      handler(val) {
        this.$emit("logList", val);
      },
      deep: true,
    },
  },
  mounted() {},
  methods: {
    implementJs(code) {
      this.$nextTick(() => {
        if (code && this.$refs.iframeRef) {
          console.log(this.$refs.iframeRef.contentWindow);
          this.$refs.iframeRef.contentWindow.postMessage({
            type: "command",
            data: code,
          });
        }
      });
    },
    assembleHtml(head, body) {
      return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    ${head}
  </head>
  <body>
    ${body}
  </body>
</html>`;
    },
  },
};
</script>

<style scoped>
.hide {
  display: none;
}
</style>
