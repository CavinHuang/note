const { escapeBackticks } = require("./util");
const md = require("./config");
const renderDemoBlock = require('./render')
const mdContainer = require("markdown-it-container");
function blockPlugin (md) {
  // 自定义容器的解析
  // 解析 ::: demo 文字描述  :::
  md.use(mdContainer, "codeDemo", {
    validate(params) {
      return params.trim().match(/^codeDemo\s*(.*)$/);
    },
    render(tokens, idx) {
      let language = tokens[idx].nesting === 1 && (tokens[idx + 1].type === "fence" ? tokens[idx + 1].info : "") || ''
      const m = tokens[idx].info.trim().match(/^codeDemo\s*(.*)$/);
      if (tokens[idx].nesting === 1) {
        const description = m && m.length > 1 ? m[1] : "";
        const content =
          tokens[idx + 1].type === "fence" ? tokens[idx + 1].content : "";
        // return `<code-demo-block language="${language}">
        // ${description ? `<div>${md.render(description)}</div>` : ""}
        // <!--vcv-demo:${
        //   `<!Language--${language}--Language-->` + content
        // }:vcv-demo-->
        // `;
        console.log('==============language===============', description)
        return language === 'js' ? (`<code-demo-block language="${language}">
        <!--vcv-demo:${
          `<!Language--${language}--Language-->` + content
        }:vcv-demo-->
        `) : `<demo sourceCode="${md.utils.escapeHtml(content)}">${
          content ? `<!--vcv-demo:${content}:vcv-demo-->` : ''
        }`
      }
      // close
      language = tokens[idx - 2].nesting === 1 && (tokens[idx - 1].type === "fence" ? tokens[idx - 1].info : "") || ''
      console.log('++++++++++++language++++++++++++++++', language)
      // console.log('++++++++++++tokens++++++++++++++++', JSON.stringify(tokens, null, 2), '++++++++++++++++++', idx)
      console.log('=============================================', JSON.stringify(tokens[idx], null, 2))
      return language === 'js' ? "</code-demo-block>" : "</demo>";
    },
  });
  // 解析 :::tip :::
  md.use(mdContainer, "tip");
  // 解析 :::warning :::
  md.use(mdContainer, "warning");
  // 解析 :::danger :::
  md.use(mdContainer, "danger");
  // 解析 :::details :::
  md.use(mdContainer, "details");
}

function codePlugin (md, options) {
  const lang = options?.lang || 'vue'
  const defaultRender = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const prevToken = tokens[idx - 1];
    const isInDemoContainer =
      prevToken &&
      prevToken.nesting === 1 &&
      prevToken.info.trim().match(/^codeDemo\s*(.*)$/)
    if (token.info.trim() === "vue" && isInDemoContainer) {
      const m = prevToken.info.trim().match(/^codeDemo\s*(.*)$/)
      const description = m && m.length > 1 ? m[1] : ''
      return `
        ${description ? `<template #description><div>${md.renderInline(description)}</div></template>` : ''}
        `
    } else if (token.info === "js" && isInDemoContainer) {
      const m = prevToken.info.trim().match(/^codeDemo\s*(.*)$/)
      const description = m && m.length > 1 ? m[1] : ''
      // return `
      //   ${ description ? `<template #description><div>${md.renderInline(description)}</div></template>` : ''}
      //   <template #highlight><pre v-pre><code class="javascript">${md.utils.escapeHtml(token.content)}</code></pre></template>`
      return `
      ${ description ? `<template #description><div>${md.renderInline(description)}</div></template>` : ''}
      `
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}

const renderPlugin = (md, options) => {
  const render = md.render
  md.render = (...args) => {
    let result = render.call(md, ...args)
    const startTag = '<!--vcv-demo:'
    const endTag = ':vcv-demo-->'
    if (result.indexOf(startTag) !== -1 && result.indexOf(endTag) !== -1) {
      const { template, script, style } = renderDemoBlock(md, result, options)
      result = template
      const data = md.__data
      const hoistedTags = data.hoistedTags || (data.hoistedTags = [])
      hoistedTags.push(script)
      hoistedTags.push(style)
    }
    return result
  }
}

const demoBlockPlugin = (md, options = {}) => {
  md.use(blockPlugin, options)
  md.use(codePlugin, options)
  md.use(renderPlugin, options)
}

module.exports = {
  blockPlugin,
  codePlugin,
  renderPlugin,
  demoBlockPlugin
}
