/**
 * @author byeguo
 * @desc 管理/定义 作用域
 *
 * @class
 *
 * 每次新建Scope实例，都会为当前节点创建一个全新的“作用域变量空间”（declaration），任何在此作用域内定义的变量都会存放在这个空间当中
 * 此外，新建Scope实例也会保存其父级作用域。
 */

import globalMap from "../store/globalMap"

import SimpleValue from "./simpleValue" // 用于创建变量

class Scope {
  constructor(parentScope) {
    this.parentScope = parentScope
    this.globalDeclaration = globalMap
    this.declaration = Object.create(null) // 每次都新建一个全新的作用域
  }

  // 获取变量值
  get(name) {
    if (this.declaration[name]) {
      return this.declaration[name]
    } else if (this.parentScope) {
      return this.parentScope.get(name)
    } else if (this.globalDeclaration[name]) {
      return this.globalDeclaration[name]
    }
    throw new ReferenceError(`${name} is not defined`)
  }

  // 对已定义变量赋值
  set(name, value) {
    if (this.declaration[name]) {
      this.declaration[name].set(value)
    } else if (this.parentScope) {
      this.parentScope.set(name, value)
    } else if (this.globalDeclaration[name]) {
      return this.globalDeclaration.set(name, value)
    } else {
      throw new ReferenceError(`${name} is not defined`)
    }
  }

  // 抽象了三种变量定义方式
  declare(name, value, kind = "var") {
    if (kind === "var") {
      return this.varDeclare(name, value)
    } else if (kind === "let") {
      return this.letDeclare(name, value)
    } else if (kind === "const") {
      return this.constDeclare(name, value)
    } else {
      throw new Error(`OreoJs: Invalid Variable Declaration Kind of "${kind}"`)
    }
  }

  varDeclare(name, value) {
    this.letDeclare(name, value)
  }

  letDeclare(name, value) {
    // 不允许重复定义
    if (this.declaration[name]) {
      throw new SyntaxError(`Identifier ${name} has already been declared`)
    }
    this.declaration[name] = new SimpleValue(value, "let")
    return this.declaration[name]
  }

  constDeclare(name, value) {
    // 不允许重复定义
    if (this.declaration[name]) {
      throw new SyntaxError(`Identifier ${name} has already been declared`)
    }
    this.declaration[name] = new SimpleValue(value, "const")
    return this.declaration[name]
  }
}

export default Scope
