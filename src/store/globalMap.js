/**
 * @author byeguo
 * @desc 管理/定义 全局变量导入
 *
 */

import SimpleValue from "../util/simpleValue"

const globalMap = {
  window: new SimpleValue("window", window),
  console: new SimpleValue("console", console),
  Date: new SimpleValue("Date", Date),
}

export default globalMap
