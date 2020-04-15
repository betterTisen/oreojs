/**
 * @author byeguo
 * @desc 用于定义变量、限制const 重复赋值
 */

class SimpleValue {
  constructor(name, value, kind = "") {
    this.name = name
    this.value = value
    this.kind = kind
  }

  set(value) {
    // 禁止重新对const类型变量赋值
    if (this.kind === "const") {
      throw new Error(`"${this.name}" is read-only`)
    } else {
      this.value = value
    }
  }

  get() {
    return this.value
  }
}

export default SimpleValue
