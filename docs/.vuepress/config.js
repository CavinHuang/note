/**
 * vitpress 配置文件
 */
const nav = require('./configs/nav')
const sidebar = require('./configs/sidebar')
const base = process.env.BASE || '/note/'
const path = require('path')
// const { base } = require('vuepress')
const isProd = process.env.NODE_ENV === "production";
module.exports = {
  base,
  lang: 'zh-CN',
  title: 'CavinHuangNote笔记',
  description: '愿世界和平！',
  public: path.resolve(__dirname, '../public'),
  bundler:
    // specify bundler via environment variable
    process.env.DOCS_BUNDLER ??
    // use vite in dev, use webpack in prod
    (isProd ? "@vuepress/bundler-webpack" : "@vuepress/bundler-vite"),
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
  plugins: [
  ],
  markdown: {
    // options for markdown-it-anchor
    anchor: { permalink: false },

    // options for markdown-it-toc
    toc: { includeLevel: [1, 2] }
  }
}