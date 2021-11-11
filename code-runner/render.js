const { escapeBackticks } = require("./util");
const { stripScript, stripStyle, stripTemplate, genInlineComponentText } = require('./util')
const md = require("./config");
const os = require('os')

module.exports = function (md, content, options) {
  // const content = md.render(source);
  const startTag = "<!--vcv-demo:";
  const startTagLen = startTag.length;
  const endTag = ":vcv-demo-->";
  const endTagLen = endTag.length;

  let componenetsString = "";
  let componenetsStringVue = "";
  const templateArr = [] // 模板输出内容
  let styleArr = [] // 样式输出内容
  let id = 0;
  let output = [];
  let start = 0;
  let language = 'vue'

  const languageStartTag = "<!Language--";
  const languageStartTagLen = languageStartTag.length;
  const languageEndTag = "--Language-->";
  const languageEndTagLen = languageEndTag.length;

  let commentStart = content.indexOf(startTag);
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart));
    // templateArr.push(content.slice(start, commentStart))
    let commentContent = content.slice(commentStart + startTagLen, commentEnd);

    // 语言标识
    const languageStart = commentContent.indexOf(languageStartTag);
    const languageEnd = commentContent.indexOf(
      languageEndTag,
      languageStart + languageStartTagLen
    );
    if (languageStart !== -1 && languageEnd !== -1) {
      language = commentContent.slice(
        languageStart + languageStartTagLen,
        languageEnd
      );
      commentContent = commentContent.substring(
        languageEnd + languageEndTagLen,
        commentContent.length
      );
    } else {
      language = 'vue'
    }

    const html = stripTemplate(commentContent)
    const script = stripScript(commentContent, `render-demo-${id}-script`)
    const style = stripStyle(commentContent)
    const demoComponentContent = genInlineComponentText(html, script, options) // 示例组件代码内容

    const demoComponentName = `vcv${id}`;
    language !== 'js' && output.push(`<${demoComponentName} />`)
    // templateArr.push(`<${demoComponentName} />`)
    styleArr.push(style)

    // output.push(
    //   `<template slot="source"><code-viewer :source="${demoComponentName}"></code-viewer></template>`
    // ); // 使用slot插槽 运行组件
    language === 'js' && output.push(
      `<ClientOnly><code-viewer :source="${demoComponentName}" language="${language}"></code-viewer></ClientOnly>`
    ); // 使用slot插槽 运行组件
    // output.push(`<template slot="source"><${demoComponentName} /></template>`); // 使用slot插槽 运行组件
    componenetsString += `${demoComponentName}: \`${escapeBackticks(
      commentContent
    )}\`,`;
    componenetsStringVue += `${JSON.stringify(demoComponentName)}: ${demoComponentContent},`

    id++;
    start = commentEnd + endTagLen;
    commentStart = content.indexOf(startTag, start);
    commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  }
  let pageScript = "";
  if (componenetsString) {
    pageScript = `<script lang="ts">
      import * as Vue from 'vue'
      ${(options?.scriptImports || []).join(os.EOL)}
      export default {
        name: 'component-doc', 
        components: {
          ${componenetsStringVue}
        },
        data() {
          return {
            ${componenetsString}
          };
        }
      }
    </script>`;
  } else if (content.indexOf("<script>") === 0) {
    start = content.indexOf("</script>") + "</script>".length;
    pageScript = content.slice(0, start);
  }

  // 合并 style 内容
  styleArr = [...new Set(styleArr)]
  let styleString = ''
  const preprocessors = ['scss', 'sass', 'less', 'stylus']
  const _style = preprocessors.includes(options.cssPreprocessor)
    ? `style lang="${options.cssPreprocessor}"`
    : 'style'
  // 支持css预处理器
  if (styleArr && styleArr.length > 0) {
    styleString = `<${_style}>${styleArr.join('')}</style>`
  } else {
    styleString = `<style></style>`
  }
  output.push(content.slice(start));
  // templateArr.push(content.slice(start))

  // return `
  //   <template>
  //     <section class="content me-doc">
  //       ${output.join("")}
  //     </section>
  //   </template>
  //   ${pageScript}
  // `;
  const tempate = `
    <section class="content me-doc">
      ${output.join("")}
    </section>
  `
  return {
    template: tempate,
    script: pageScript,
    style: styleString
  }
};
