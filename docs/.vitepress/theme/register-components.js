import Demo from '../../../components/src/Demo.vue'
import DemoBlock from '../../../components/src/DemoBlock.vue'
import CodeDemoBlock from '../../../components/src/demo-block.vue'
import CodeViewer from '../../../components/src/code-viewer.jsx'
export function registerComponents(app) {
  app.component('Demo', Demo)
  app.component('DemoBlock', DemoBlock)
  app.component('CodeDemoBlock', CodeDemoBlock)
  app.component('CodeViewer', CodeViewer)
}
