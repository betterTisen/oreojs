/**
 * @author byeguo
 * @desc 节点处理器，处理AST当中的节点
 */

const NodeHandler = {
  // Program
  Program(nodeIterator) {
    for (const e of nodeIterator.node.body) {
      nodeIterator.traverse(e)
    }
  },

  // 表达式语句节点
  ExpressionStatement(nodeIterator) {
    nodeIterator.traverse(nodeIterator.node.expression)
  },

  // 函数调用表达式，即表示了 func(1, 2) 这一类型的语句
  CallExpression(nodeIterator) {
    const func = nodeIterator.traverse(nodeIterator.node.callee)
    const args = nodeIterator.node.arguments.map((arg) => nodeIterator.traverse(arg))
    let value
    if (nodeIterator.node.callee.type === "MemberExpression") {
      value = nodeIterator.traverse(nodeIterator.node.callee.object)
    }
    return func.apply(value, args)
  },

  // 成员表达式节点，即表示引用对象成员的语句
  MemberExpression(nodeIterator) {
    const obj = nodeIterator.traverse(nodeIterator.node.object)
    const { name } = nodeIterator.node.property
    return obj[name]
  },

  // 标识符
  Identifier(nodeIterator) {
    const { name } = nodeIterator.node

    if (name === "undefined") {
      return undefined
    }

    return nodeIterator.scope.get(nodeIterator.node.name).value
  },

  //字面量
  Literal(nodeIterator) {
    return nodeIterator.node.value
  },

  // 变量声明
  VariableDeclaration(nodeIterator) {
    const { kind } = nodeIterator.node
    const variableNodes = nodeIterator.node.declarations
    for (const variableNode of variableNodes) {
      const k = variableNode.id.name
      const v = variableNode.init ? nodeIterator.traverse(variableNode.init) : undefined
      nodeIterator.scope.declare(k, v, kind)
    }
  },

  // 赋值表达式节点，operator 属性表示一个赋值运算符，left 和 right 是赋值运算符左右的表达式。
  AssignmentExpression(nodeIterator) {
    const { operator, left, right } = nodeIterator.node
    const { name } = left
    const { value } = right
    if (operator === "=") {
      nodeIterator.scope.set(name, value)
    }
  },
}

export default NodeHandler
