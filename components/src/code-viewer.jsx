import { defineComponent, reactive, computed, ref, watch, h } from 'vue'
import CodeEditor from "./code-editor.vue";
import CodeEditorDemo from "./code-editor-demo.vue";
import { ElTooltip } from "element-plus";
import MeButton from "./button.vue";
import { debounce } from "throttle-debounce";
import { toggleClass } from "../utils/DOMhelper";
import { parseComponent } from "../utils/sfcParser/parser";
import { genStyleInjectionCode } from "../utils/sfcParser/styleInjection";
import { isEmpty, extend, generateId } from "../utils/util";
import { addStylesClient } from "../utils/style-loader/addStylesClient";
// import Locale from "../mixins/locale";
import CodeJsRunner from "./code-js-runner.vue";
import Console from "./console.vue";

// 字体图标
import "../fonts/iconfont.css";
import "../styles/code-viewer.scss";
export default defineComponent({
  name: "CodeViewer",
  components: {
    CodeJsRunner,
    CodeEditor,
    ElTooltip,
    Console
  },
  props: {
    theme: { type: String, default: "dark" }, //light
    showCode: { type: Boolean, default: false },
    source: { type: String },
    renderToolbar: { type: Function },
    errorHandler: { type: Function },
    debounceDelay: {
      type: Number,
      default: 300,
    },
    language: {
      type: String,
      default: "html",
    },
    component: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    const isShowDefault = ref(true)
    const className = ["vue-code-viewer", "vue-app"]
    const dynamicComponent = reactive({
      component: {
        template: "<div>Hello Vue.js!</div>",
      },
    })
    const state = reactive({
      code: props.source,
      hasError: false,
      errorMessage: null,
      showCodeEditor: props.showCode,
      showCodeIcon: {},
      logList: [],
      jsRunnerCode: '',
      viewId: `vcv-${generateId()}`
    })
    const _source = computed({
      get: () => {
        return state.code ? state.code : props.source
      },
      set: (value) => {
       state.code = value
      }
    })
    const debounceErrorHandler = debounce(props.debounceDelay, props.errorHandler)
    const stylesUpdateHandler = addStylesClient(state.viewId, {})

    watch(state, () => {
      if (!state.hasError) createPreviewComponent()
    })

    function runJs(code) {
      state.jsRunnerCode = code
    }
    // 初始化
    function _initialize() {
      // md-loader 用于静态示例展示处理  模板字符串 嵌套 模板字符串 情况特殊处理，
      if (!isEmpty(state.code)) {
        state.code = state.code.replace(/<--backticks-->/g, "\u0060");
      }
      // 传入初始值赋值  prop.source=>code
      handleCodeChange(_source.value);
    }
    // 更新 code 内容
    function handleCodeChange(val) {
      state.code = val;
    }

    const sfcDescriptor = computed(() => parseComponent(state.code))
    const isCodeEmpty = computed(() => !(state.code && !isEmpty(state.code.trim())));

    function genComponent() {
      const { template, script, styles, customBlocks, errors } =
       sfcDescriptor.value;

      // console.log(this.sfcDescriptor);

      const templateCode = template ? template.content.trim() : ``;
      let scriptCode = script ? script.content.trim() : ``;
      const styleCodes = genStyleInjectionCode(styles, state.viewId);

      // 构建组件
      const demoComponent = {};

      // 组件 script
      if (!isEmpty(scriptCode)) {
        const componentScript = {};
        scriptCode = scriptCode.replace(
          /export\s+default/,
          "componentScript ="
        );
        // eval(scriptCode);
        extend(demoComponent, componentScript);
      }

      // 组件 template
      // id="${componentId}"
      demoComponent.template = `<section id="${state.viewId}" class="result-box" >
        ${templateCode}
      </section>`;

      // 组件 style
      // https://github.com/vuejs/vue-style-loader/blob/master/lib/addStylesClient.js
      stylesUpdateHandler(styleCodes);

      // 组件内容更新
      console.log(11111111, demoComponent, "22222");
      dynamicComponent.name = state.viewId
      dynamicComponent.component = demoComponent
    }
    // 代码检查
    function codeLint() {
      // 校验代码是否为空
      state.hasError = isCodeEmpty.value
      state.errorMessage = isCodeEmpty.value
        ? '没有代码'
        : null;
      // 代码为空 跳出检查
      if (isCodeEmpty.value) return;

      // 校验代码是否存在<template>
      const { template } = sfcDescriptor.value;
      const templateCode =
        template && template.content ? template.content.trim() : ``;
      const isTemplateEmpty = isEmpty(templateCode);

      state.hasError = isTemplateEmpty;
      state.errorMessage = isTemplateEmpty
        ? '没有template'
        : null;
      // 代码为空 跳出检查
      if (isTemplateEmpty) return;
    }

    function createPreviewComponent() {
      console.log("==========================");
      if (props.language === "js") {
        console.log("js");
      } else {
        codeLint();
        // 错误事件处理
        state.hasError && props.errorHandler && debounceErrorHandler(state.errorMessage);
        genComponent();
      }
    }

    function  renderPreview() {
      const { hasError, errorMessage } = state
      // <div>{this.initialExample ? this.initialExample : <div>Loading...</div>}</div>
      if (hasError) {
        return <pre class="code-view-error">{errorMessage}</pre>;
      }

      const renderComponent = () => h(props.component)
      console.log(renderComponent, "++++++++++");

      return (
        <div class="code-view zoom-1">
          {renderComponent()}
        </div>
      );
    }
    // 组件代码编辑器展示
    function handleShowCode(e) {
      state.showCodeEditor = !state.showCodeEditor;
      console.log(state)
      e.preventDefault()
      e.stopPropagation()
    }
    const codeViewer = ref(null)
    // 组件演示背景透明切换
    function handleChangeTransparent() {
      toggleClass(codeViewer.value, "vue-code-transparent");
    }
    _initialize()
    runJs(state.code)

    const showCodeButton = (
      <ElTooltip
        class="item"
        effect="dark"
        content={'111111'}
        placement="top"
      >
        <MeButton
          icon="code"
          size="xs"
          circle
          onClick={handleShowCode}
        ></MeButton>
      </ElTooltip>
    );
    const showTransparentButton = (
      <ElTooltip
        class="item"
        effect="dark"
        content={'111111'}
        placement="top"
      >
        <MeButton
          icon="transparent"
          size="xs"
          circle
          onClick={handleChangeTransparent}
        ></MeButton>
      </ElTooltip>
    );
    const defaultButtonRender = (showCodeButton, showTransparentButton) => {
      return (
        <div>
          {showCodeButton} {showTransparentButton}
        </div>
      );
    }
    const consoleRef = ref(null)
    return () => (
      <div class={className} ref={codeViewer}>
        <div class="code-view-wrapper">
          {/* --------- renderExample  --------- */}
          {props.language === "js" ? (
            <div>
              <code-js-runner
                content={state.jsRunnerCode}
                onLogList={(log) => {
                  state.logList = log;
                }}
              ></code-js-runner>
              <Console logList={state.logList} ref={consoleRef} />
            </div>
          ) : (
            isShowDefault.value && slots.default ? slots.default() : renderPreview()
          )}
          {/* --------- toolbar   --------- */}
          <div class="code-view-toolbar">
            {props.renderToolbar
              ? props.renderToolbar(showCodeButton, showTransparentButton)
              : defaultButtonRender(showCodeButton, showTransparentButton)}
          </div>
          {/* --------- CodeEditor   --------- */}
          {state.showCodeEditor && (
            <>
              <CodeEditorDemo
                lineNumbers
                mode={props.language === "js" ? "application/x-javascript" : ""}
                codeHandler={handleCodeChange}
                value={state.code}
              />
              {props.language === "js" ? (
                <div class="runner-action">
                  <button
                    class="runer-btn"
                    onClick={() => {
                      consoleRef.value && consoleRef.value.clear();
                      runJs(state.code);
                    }}
                  >运行</button>
                </div>
              ) : (
                ""
              )}
            </>
          )}
        </div>
      </div>
    );
  }
})
