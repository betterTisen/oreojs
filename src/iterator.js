/**
 * @author byeguo
 * @desc 节点遍历器，递归遍历AST内的每一个节点并调用对应的方法进行解析
 *
 */

import NodeHandler from "./util/es_handle"

class NodeIterator {
  constructor(node, scope) {
    this.node = node
    this.scope = scope
    this.nodeHandler = NodeHandler
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
