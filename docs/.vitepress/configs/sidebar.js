module.exports = {
  '/vue3/': getVue3Sidebar()
}
function getVue3Sidebar() {
  return [
    {
      text: 'test1',
      children: [
      ]
    },
    {
      text: 'text1',
      link: '/vue3/'
    }
  ]
}
