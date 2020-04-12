/**
 * @author byeguo
 * @desc OreoJs 入口函数
 *
 * @class
 * 运行`.run()`方法即可输出运行结果
 *
 */

import { Parser } from "acorn"
import NodeIterator from "./iterator"
import Scope from "./scope"

class Oreojs {
  constructor(code = "") {
    this.code = code
    this.ast = Parser.parse(code)
    this.nodeIterator = null
    this.init()
  }
  init() {
    this.nodeIterator = new NodeIterator(null, new Scope())
  }
  run() {
    return this.nodeIterator.traverse(this.ast)
  }
}

export default Oreojs
