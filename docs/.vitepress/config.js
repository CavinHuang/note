/**
 * vitpress 配置文件
 */
const nav = require('./configs/nav')
const sidebar = require('./configs/sidebar')
const base = process.env.BASE || '/'
module.exports = {
  base,
  title: 'CavinHuangNote学习笔记',
  themeConfig: {
    lastUpdated: '最后更新',
    editLinkText: '编辑此页',
    // 编辑连接
    editLink: true,
    nextLinks: true,
    prevLinks: true,
    nav,
    sidebar,
  },
  markdown: {
    // options for markdown-it-anchor
    anchor: { permalink: false },

    // options for markdown-it-toc
    toc: { includeLevel: [1, 2] },

    config: (md) => {
      const { demoBlockPlugin } = require('vitepress-theme-demoblock')
      md.use(demoBlockPlugin, {
        cssPreprocessor: 'less'
      })
    }
  }
}