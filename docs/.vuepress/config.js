/**
 * vitpress 配置文件
 */
const nav = require('./configs/nav')
const sidebar = require('./configs/sidebar')
const base = process.env.BASE || '/'
const path = require('path')
// const { base } = require('vuepress')
module.exports = {
  base,
  lang: 'zh-CN',
  title: 'CavinHuangNote笔记',
  description: '愿世界和平！',
  public: path.resolve(__dirname, '../public'),
  themeConfig: {
    lastUpdated: '最后更新',
    editLinkText: '编辑此页',
    // 编辑连接
    editLink: true,
    nextLinks: true,
    prevLinks: true,
    navbar: nav,
    sidebar,
  },
  markdown: {
    // options for markdown-it-anchor
    anchor: { permalink: false },

    // options for markdown-it-toc
    toc: { includeLevel: [1, 2] },

    config: (md) => {
      // const { demoBlockPlugin } = require('../../demoblock')
      const { demoBlockPlugin: demoBlockPluginRuner } = require('../../code-runner')
      // md.use(demoBlockPlugin, {
      //   cssPreprocessor: 'scss'
      // })
      md.use(demoBlockPluginRuner)
    }
  }
}