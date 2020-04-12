/**
 * @author byeguo
 * @desc 管理/定义 全局变量导入
 *
 */

import SimpleValue from "../util/simpleValue"

const globalMap = {
  window: new SimpleValue(window),
  console: new SimpleValue(console),
}

export default globalMap
