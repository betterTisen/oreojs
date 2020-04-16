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

  // 标识符(用于读取值)
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
    const value = right.value ? right.value : nodeIterator.traverse(right)
    if (operator === "=") {
      nodeIterator.scope.set(name, value)
      return value
    }
  },

  // 块级作用域
  BlockStatement(nodeIterator) {
    const scope = nodeIterator.createScope()
    for (const e of nodeIterator.node.body) {
      // 判断 Return 关键字
      if (NodeHandler.isReturnStatement(e.type)) {
        const arg = e.argument ? nodeIterator.traverse(e.argument, { scope }) : undefined
        return { type: "isReturn", value: arg }
      } else if (NodeHandler.isBreakStatement(e.type)) {
        return { type: "isBreak" }
      } else if (NodeHandler.isContinueStatement(e.type)) {
        return { type: "isContinue" }
      }
      const signal = nodeIterator.traverse(e, { scope })

      if (!signal) {
        continue
      }

      // 处理关键字
      if (signal.type === "isReturn") {
        return signal
      }
    }
  },

  // 函数定义节点处理器
  FunctionDeclaration(nodeIterator) {
    const { name } = nodeIterator.node.id
    const fn = NodeHandler.FunctionExpression(nodeIterator)
    nodeIterator.scope.declare(name, fn, "let")
  },

  // 函数表达式节点处理器
  FunctionExpression(nodeIterator) {
    const { params, body } = nodeIterator.node

    const fn = function () {
      const scope = nodeIterator.createScope()
      scope.declare("this", this, "const")
      scope.declare("arguments", arguments, "const")

      // 函数变量赋值
      params.forEach((param, i) => {
        scope.declare(param.name, arguments[i], "let")
      })

      // 解析 BlockStatement
      const signal = nodeIterator.traverse(body, { scope })

      if (signal.type === "isReturn") {
        return signal.value
      }
    }

    return fn
  },

  UpdateExpression(nodeIterator) {
    const { operator, prefix } = nodeIterator.node
    const { name } = nodeIterator.node.argument
    let val = nodeIterator.scope.get(name).value

    operator === "++" ? nodeIterator.scope.set(name, val + 1) : nodeIterator.scope.set(name, val - 1)

    if (operator === "++" && prefix) {
      return ++val
    } else if (operator === "++" && !prefix) {
      return val++
    } else if (operator === "--" && prefix) {
      return --val
    } else {
      return val--
    }
  },

  // 二元运算符
  BinaryOperatorMap: {
    "==": (l, r) => l == r,
    "!=": (l, r) => l != r,
    "===": (l, r) => l === r,
    "!==": (l, r) => l !== r,
    "<": (l, r) => l < r,
    "<=": (l, r) => l <= r,
    ">": (l, r) => l > r,
    ">=": (l, r) => l >= r,
    "<<": (l, r) => l << r,
    ">>": (l, r) => l >> r,
    ">>>": (l, r) => l >>> r,
    "+": (l, r) => l + r,
    "-": (l, r) => l - r,
    "*": (l, r) => l * r,
    "/": (l, r) => l / r,
    "%": (l, r) => l % r,
    "|": (l, r) => l | r,
    "^": (l, r) => l ^ r,
    "&": (l, r) => l & r,
    in: (l, r) => l in r,
    instanceof: (l, r) => l instanceof r,
  },

  // 二元运算表达式节点
  BinaryExpression(nodeIterator) {
    const { left, right, operator } = nodeIterator.node
    const l = nodeIterator.traverse(left)
    const r = nodeIterator.traverse(right)
    return NodeHandler.BinaryOperatorMap[operator](l, r)
  },

  // if 节点处理
  IfStatement(nodeIterator) {
    const { test, consequent, alternate } = nodeIterator.node
    const condition = nodeIterator.traverse(test)
    if (condition) {
      return nodeIterator.traverse(consequent)
    } else if (alternate) {
      return nodeIterator.traverse(alternate)
    }
  },

  // for 节点处理
  ForStatement(nodeIterator) {
    const { init, test, update, body } = nodeIterator.node
    const scope = nodeIterator.createScope()
    for (nodeIterator.traverse(init, { scope }); nodeIterator.traverse(test, { scope }); nodeIterator.traverse(update, { scope })) {
      const signal = nodeIterator.traverse(body, { scope })
      if (!signal) {
        continue
      }

      if (signal.type === "isBreak") {
        break
      } else if (signal.type === "isContinue") {
        continue
      } else if (signal.type === "isReturn") {
        return signal
      }
    }
  },

  // keyword this
  ThisExpression(nodeIterator) {
    return nodeIterator.scope.get("this").value
  },

  // keyword new
  NewExpression(nodeIterator) {},

  // keyword return
  isReturnStatement(type) {
    return type === "ReturnStatement" ? true : false
  },
  // keyword break
  isBreakStatement(type) {
    return type === "BreakStatement" ? true : false
  },
  // keyword continue
  isContinueStatement(type) {
    return type === "ContinueStatement" ? true : false
  },
}

// 这里使用 commonjs 的写法，this注入全局变量 window
// 若使用 es module，this 会指向 undefined
module.exports = NodeHandler
