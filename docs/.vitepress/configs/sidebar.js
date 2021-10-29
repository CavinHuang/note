module.exports = {
  '/vue3/': getVue3Sidebar()
}
function getVue3Sidebar() {
  return [
    {
      text: 'vue3使用和经验',
      children: [
        {
          text:  'Vue3.0 新特性以及使用经验总结',
          link: '/vue3/Vue3.0 新特性以及使用经验总结'
        },
        {
          text: 'vue3响应式系统的实现以及源码解析',
          link: '/vue3/vue3响应式系统的实现以及源码解析'
        }
      ]
    },
    {
      text: 'vue3结合TS使用',
      link: '/vue3/'
    }
  ]
}
