/**
 * @author byeguo
 * @desc 节点遍历器，递归遍历AST内的每一个节点并调用对应的方法进行解析
 */

/**
 * @class
 * @param object 语法树的json
 * @param object 当前作用域
 * @createScope  创建作用域，用于区分父子作用域
 * @traverse 解析语法树
 */

import NodeHandler from "../es_handle"

import Scope from "./scope"

class NodeIterator {
  constructor(node, scope) {
    this.node = node
    this.scope = scope
    this.nodeHandler = NodeHandler
  }

  createScope() {
    return new Scope(this.scope)
  }

  traverse(node) {
    const scope = this.scope
    const _evel = this.nodeHandler[node.type]
    const nodeIterator = new NodeIterator(node, scope)
    if (!_evel) {
      throw new Error(`Unknown node type "${node.type}"`)
    }
    return _evel(nodeIterator)
  }
}

export default NodeIterator
