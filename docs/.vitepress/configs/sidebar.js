
module.exports={
  '/vue3/': getVue3Sidebar()
}

function getVue3Sidebar() {
  return [
  {
    text: 'vue3起手式',
    children: [
      {
        text: 'createApp创建过程解析',
        link: '/vue3/vue3起手式/createApp创建过程解析'
      }
    ]
  }
]
}

