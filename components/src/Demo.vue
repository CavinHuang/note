<template>
  <div
    ref="demoBlock"
    :class="['demo-block', blockClass, customClass ? customClass : '', { hover }]"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div v-if="$slots.description" ref="description" class="description">
      <slot name="description" />
    </div>
    <div class="source">
      <slot />
    </div>
    <div ref="meta" class="meta">
      <div ref="highlight" class="highlight line-numbers">
        <pre class="line-numbers language-html" v-html="codeHtml"></pre>
      </div>
    </div>
    <div
      ref="control"
      :class="['demo-block-control', { 'is-fixed': fixedControl }]"
      @click="onClickControl"
    >
      <transition name="arrow-slide">
        <i
          :class="[
            'control-icon',
            { 'icon-caret-down': !isExpanded, 'icon-caret-up': isExpanded, hovering: hover }
          ]"
        ></i>
      </transition>
      <transition name="text-slide">
        <span v-show="hover" class="control-text">{{ controlText }}</span>
      </transition>
      <div class="control-button-wrap">
        <transition name="text-slide">
          <span v-show="isExpanded" class="control-button copy-button" @click.stop="onCopy">
            {{ copyText }}
          </span>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useData } from 'vitepress'
import {
  ref,
  watchEffect,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  getCurrentInstance
} from 'vue'
import { throttle } from '../utils/throttle'
import clipboardCopy from '../utils/clipboard-copy'
// 引入默认样式
import Prism from "prismjs"
import 'prismjs/plugins/line-numbers/prism-line-numbers'
// function highlightCode(md, str, lang) {
//   // 此处判断是否有添加代码语言
//   if (lang && hljs.getLanguage(lang)) {
//     try {
//       // 得到经过highlight.js之后的html代码
//       const preCode = hljs.highlight(lang, str, true).value
//       // 以换行进行分割
//       const lines = preCode.split(/\n/).slice(0, -1)
//       // 添加自定义行号
//       let html = lines.map((item, index) => {
//         return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
//       }).join('')
//       html = '<ol>' + html + '</ol>'
//       // 添加代码语言
//       if (lines.length) {
//         html += '<b class="name">' + lang + '</b>'
//       }
//       return '<pre class="hljs"><code>' +
//         html +
//         '</code></pre>'
//     } catch (__) {}
//   }
// // 未添加代码语言，此处与上面同理
//   const preCode = str
//   const lines = preCode.split(/\n/).slice(0, -1)
//   let html = lines.map((item, index) => {
//     return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
//   }).join('')
//   html = '<ol>' + html + '</ol>'
//   return '<pre class="hljs"><code>' +
//     html +
//     '</code></pre>'
// }

export default {
  name: 'Demo',
  props: {
    customClass: String,
    sourceCode: String
  },
  setup(props) {
    const hover = ref(false)
    const fixedControl = ref(false)
    const isExpanded = ref(false)
    const isShowTip = ref(false)
    // const codepen = reactive({
    //   html: stripTemplate(props.sourceCode),
    //   script: stripScript(props.sourceCode),
    //   style: stripStyle(props.sourceCode)
    // })

    const data = useData()
    const route = useRoute()

    const pathArr = ref(route.path.split('/'))
    const component = computed(() => pathArr.value[pathArr.value.length - 1].split('.')[0])
    watch(
      () => route.path,
      path => {
        pathArr.value = path.split('/')
      }
    )

    // const codeHtml = computed(() => highlightCode(null, props.sourceCode, 'html'))
    const codeHtml = computed(() => {
      return Prism.highlight(
        props.sourceCode,
        Prism.languages.html,
        "html"
      )
    })
    onMounted(() => {
      Prism.highlightAll()
      console.log(Prism, codeHtml)
    })

    const onClickControl = () => {
      isExpanded.value = !isExpanded.value
      hover.value = isExpanded.value
    }

    const blockClass = computed(() => {
      return `demo-${component.value}`
    })
    const locale = computed(() => {
      return (
        data.theme.value.demoblock?.[data.localePath.value] ?? {
          'hide-text': '隐藏代码',
          'show-text': '显示代码',
          'copy-button-text': '复制代码片段',
          'copy-success-text': '复制成功'
        }
      )
    })

    const copyText = computed(() => {
      return isShowTip.value ? locale.value['copy-success-text'] : locale.value['copy-button-text']
    })

    const controlText = computed(() => {
      return isExpanded.value ? locale.value['hide-text'] : locale.value['show-text']
    })

    // template refs
    const highlight = ref(null)
    const description = ref(null)
    const meta = ref(null)
    const control = ref(null)
    const demoBlock = ref(null)

    const codeAreaHeight = computed(() => {
      if (description.value) {
        return highlight.value.clientHeight + 20
      }
      return highlight.value.clientHeight
    })

    const _scrollHandler = () => {
      const { top, bottom, left } = meta.value.getBoundingClientRect()
      const innerHeight = window.innerHeight || document.body.clientHeight
      fixedControl.value = bottom > innerHeight && top + 44 <= innerHeight
      control.value.style.left = fixedControl.value ? `${left}px` : '0'
      const dv = fixedControl.value ? 1 : 2
      control.value.style.width = `${demoBlock.value.offsetWidth - dv}px`
    }
    const scrollHandler = throttle(_scrollHandler, 200)
    const removeScrollHandler = () => {
      window.removeEventListener('scroll', scrollHandler)
      window.removeEventListener('resize', scrollHandler)
    }

    const onCopy = () => {
      clipboardCopy(props.sourceCode)
      isShowTip.value = true
      setTimeout(() => {
        isShowTip.value = false
      }, 1300)
    }

    const goCodepen = () => {}

    watch(isExpanded, val => {
      meta.value.style.height = val ? `${codeAreaHeight.value + 1}px` : '0'
      if (!val) {
        fixedControl.value = false
        control.value.style.left = '0'
        control.value.style.width = `${demoBlock.value.offsetWidth - 2}px`
        removeScrollHandler()
        return
      }
      setTimeout(() => {
        window.addEventListener('scroll', scrollHandler)
        window.addEventListener('resize', scrollHandler)
        _scrollHandler()
      }, 300)
    })

    onMounted(() => {
      nextTick(() => {
        if (!description.value) {
          highlight.value.style.width = '100%'
        }
      })
    })

    onBeforeUnmount(() => {
      removeScrollHandler()
    })

    return {
      codeHtml,
      blockClass,
      hover,
      fixedControl,
      isExpanded,
      locale,
      controlText,
      onClickControl,
      copyText,
      highlight,
      description,
      meta,
      control,
      onCopy,
      demoBlock
    }
  }
}
</script>

<style scoped lang='scss'>
.demo-block {
  margin: 10px 0;
  border: solid 1px #ebebeb;
  border-radius: 3px;
  transition: 0.2s;
}

.demo-block.hover {
  box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6), 0 2px 4px 0 rgba(232, 237, 250, 0.5);
}

.source {
  box-sizing: border-box;
  margin: 12px;
  padding: 24px;
  transition: 0.2s;
  overflow: auto;
}

.meta {
  border-top: solid 1px #ebebeb;
  background-color: var(--code-bg-color);
  overflow: hidden;
  height: 0;
  transition: height 0.2s;
}

.description {
  border: solid 1px #ebebeb;
  border-radius: 3px;
  padding: 20px;
  box-sizing: border-box;
  line-height: 26px;
  color: var(--c-text);
  word-break: break-word;
  margin: 10px 10px 6px 10px;
  background-color: #fff;
}

.demo-block-control {
  border-top: solid 1px #eaeefb;
  height: 44px;
  box-sizing: border-box;
  background-color: #fff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  text-align: center;
  margin-top: -1px;
  color: #d3dce6;
  cursor: pointer;
  position: relative;
}

.demo-block-control.is-fixed {
  position: sticky;
  bottom: 0;
  /* width: calc(100% - 320px - 48px - 200px - 1px); */
  border-right: solid 1px #eaeefb;
  z-index: 2;
}

.demo-block-control .control-icon {
  display: inline-block;
  font-size: 16px;
  line-height: 44px;
  transition: 0.3s;
}
.demo-block-control .control-icon.hovering {
  transform: translateX(-40px);
}

.demo-block-control .control-text {
  position: absolute;
  transform: translateX(-30px);
  font-size: 14px;
  line-height: 44px;
  font-weight: 500;
  transition: 0.3s;
  display: inline-block;
}

.demo-block-control:hover {
  color: var(--c-brand);
  background-color: #f9fafc;
}

.demo-block-control .text-slide-enter,
.demo-block-control .text-slide-leave-active {
  opacity: 0;
  transform: translateX(10px);
}

.demo-block-control .control-button {
  color: var(--c-brand);
  font-size: 14px;
  font-weight: 500;
  margin: 0 10px;
}

.demo-block-control .control-button-wrap {
  line-height: 43px;
  position: absolute;
  top: 0;
  right: 0;
  padding-left: 5px;
  padding-right: 25px;
}
</style>
<style lang='scss'>
code[class*="language-"],
pre {
	color: #f8f8f2;
	background: none;
	text-shadow: 0 1px rgba(0, 0, 0, 0.3);
	font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
	font-size: 1em;
	text-align: left;
	white-space: pre;
	word-spacing: normal;
	word-break: normal;
	word-wrap: normal;
	line-height: 1.5;

	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;

	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
}

/* Code blocks */
pre {
	padding: 1em;
	margin: .5em 0;
	overflow: auto;
	border-radius: 0.3em;
}

:not(pre) > code[class*="language-"],
pre {
	/*background: #272822;*/
	background: #384548;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
	padding: .1em;
	border-radius: .3em;
	white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
	color: slategray;
}

.token.punctuation {
	color: #f8f8f2;
}

.namespace {
	opacity: .7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
	color: #ffa07a;
}

.token.boolean,
.token.number {
	color: #ae81ff;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
	color: #a6e22e;
}

.token.operator {
	color: #00e0e0;
  background: transparent;
}

.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
	color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
	color: #e6db74;
}

.token.keyword {
	color: #66d9ef;
}

.token.regex,
.token.important {
	color: #fd971f;
}

.token.important,
.token.bold {
	font-weight: bold;
}
.token.italic {
	font-style: italic;
}

.token.entity {
	cursor: help;
}
</style>
